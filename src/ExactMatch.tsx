import React from "react";
import _ from "lodash";
import levenshtein from "js-levenshtein";

import { membersForSearch, searchableToolsURLDescriptors } from "./seed";
import { Results } from "./Results";

const members = membersForSearch.map(m => ({
  ...m,
  filterKey: getFilterKey(m)
}));

function getFilterKey(member: {
  nameFirst: string;
  nameLast: string;
  ssn: string;
}) {
  return `${member.nameLast}, ${member.nameFirst} ${
    member.nameLast
  } ${member.ssn.substr(-4)}`;
}

const searchableToolsURLDescriptorsWithFilterKey: (typeof searchableToolsURLDescriptors[0] & {
  filterKey: string;
})[] = searchableToolsURLDescriptors
  .map(u => {
    return `${u.name}, ${u.searchTags}`.split(", ").map(t => ({
      ...u,
      filterKey: t
    }));
  })
  .flat();

const searchableToolsURLDescriptorsWithFilterKey2: (typeof searchableToolsURLDescriptors[0] & {
  filterKey: string;
})[] = (() => {
  return searchableToolsURLDescriptors
    .map(u => {
      const irrelevantTags = ["/", "-", "&", "", "a", "and"];
      const tags = `${u.name}, ${u.searchTags}`;
      const thing = tags
        .split(", ")
        .concat(tags.split(/,\s|\s/))
        .filter(t => !irrelevantTags.includes(t))
        .map(t => ({
          ...u,
          filterKey: t.toLowerCase()
        }));

      const thingUnique = _.uniqBy(thing, t => t.filterKey);
      return thingUnique;
    })
    .flat();
})();

export function ExactMatch({
  value,
  version
}: {
  value: string;
  version: string;
}) {
  const regex = new RegExp(
    value
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map(word => `(?=.*${word})`)
      .join(""),
    "ig"
  );

  const membersFiltered =
    value === "" ? [] : members.filter(m => regex.test(m.filterKey));

  const toolsFiltered: typeof searchableToolsURLDescriptorsWithFilterKey[0][] =
    value === ""
      ? []
      : (() => {
          const result = [];
          const levenshteinResults = [];

          if (version === "one" || version === "two") {
            const set = new Set<string>();
            const haystack =
              version === "one"
                ? searchableToolsURLDescriptorsWithFilterKey
                : searchableToolsURLDescriptorsWithFilterKey2;
            for (const tool of haystack) {
              if (set.has(tool.name)) {
                continue;
              }

              if (regex.test(tool.filterKey)) {
                result.push(tool);
                set.add(tool.name);
              } else {
                if (
                  levenshtein(tool.filterKey, value.trim().toLowerCase()) <= 2
                ) {
                  levenshteinResults.push(tool);
                  set.add(tool.name);
                }
              }
            }

            return result.concat(levenshteinResults);
          } else if (version === "three" || version === "four") {
            for (const tool of searchableToolsURLDescriptors) {
              const nameAndTags = `${tool.name}, ${tool.searchTags}`.split(
                ", "
              );
              const matchedTagNoMisspellings = nameAndTags.find(t =>
                regex.test(t)
              );
              if (matchedTagNoMisspellings != null) {
                result.push({ ...tool, filterKey: matchedTagNoMisspellings });
              } else {
                // Originally I was concernced of the performance implications of
                //  one callback in every every iteration of this outer loop,
                // and another one per iteration of the inner loop of `.every`.
                // So I did this: https://jsperf.com/function-allocation-inside-of-loop/1
                // Also: https://jsben.ch/gjeA2
                // Not concerned anymore.
                for (const nameAndTag of nameAndTags) {
                  const searchWords = value.trim().split(" ");

                  const allSearchWordsHaveAcceptableDistance = searchWords.every(
                    searchWord => {
                      if (version === "four" && searchWord.length <= 4) {
                        return false;
                      }
                      const hasOneTagWithAllowedDistance = nameAndTag
                        .split(" ")
                        .some(
                          t =>
                            levenshtein(
                              t.toLowerCase(),
                              searchWord.toLowerCase()
                            ) <= 2
                        );
                      // If we needed to optimize, we could remove the nameAndTag
                      // that matched here so that when we iterate again to compare
                      // the next search word, we do not compare the same tag twice.
                      // This will have one slight difference in the output since
                      // repeating the same word in the input will not match an
                      // item that doesn't have that tag the same amount of times
                      // (e.g. "demographic demographic" will not match an item
                      // that only has one "demographic" tag).
                      //
                      // I'm not going to do that though since there's always a very
                      // small amount of tags for each item so the performance improvement
                      // would be undetectable and would complicate the code needlessly.
                      return hasOneTagWithAllowedDistance;
                    }
                  );
                  if (allSearchWordsHaveAcceptableDistance) {
                    levenshteinResults.push({
                      ...tool,
                      filterKey: nameAndTag
                    });
                    break;
                  }
                }
              }
            }
            return result.concat(levenshteinResults);
          }

          throw new TypeError("unrecognized version");
        })();

  return (
    <Results
      key={value}
      membersFiltered={membersFiltered}
      toolsFiltered={toolsFiltered}
      value={value}
    />
  );
}

/*
Test caees

"demographic" should match exactly "Demographic Census Report" by name
"dmeographic" should match by leveshtein distance "Demographic Census Report" because of split "demographic" tag
"Dmeographic" should match by leveshtein distance "Demographic Census Report" because of split "demographic" tag
  (should be case insensitive)
"dmeographic " should match by leveshtein distance "Demographic Census Report" because of split "demographic" tag
  (leading space should not affect it)  
"Dmeographic " should match by leveshtein distance "Demographic Census Report" because of split "demographic" tag
  (leading space should not affect it)
"demographic change"
"dmeographic change"
"change demographic"
"change dmeographic"
"demographic demographic"
"deographic deographic"
"ben"
*/
