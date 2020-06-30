import React from "react";
import _ from "lodash";
import levenshtein from "js-levenshtein";

import { membersForSearch, searchableToolsURLDescriptors } from "./seed";
import { Results } from "./Results";

const membersForSearchWithKey = membersForSearch.map(m => ({
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

export function Final({ value }: { value: string }) {
  const includeDependents = true;
  const [memberSearchResults, toolsSearchResults] = searchMembersAndTools(
    membersForSearchWithKey,
    includeDependents,
    searchableToolsURLDescriptors,
    value
  );

  return (
    <Results
      key={value}
      membersFiltered={value === "" ? [] : memberSearchResults}
      toolsFiltered={value === "" ? [] : toolsSearchResults}
      value={value}
    />
  );
}

function searchMembersAndTools<
  T extends { filterKey: string; role: string },
  U extends { name: string; searchTags: string }
>(
  membersForSearch: T[],
  includeDependents: boolean,
  searchableToolsURLDescriptors: U[],
  query: string
): [T[], (U & { filterKey: string })[]] {
  const regex = new RegExp(
    query
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map(word => `(?=.*${word})`)
      .join(""),
    "ig"
  );

  // Filter members
  const maxResults = 250;
  const memberSearchResults = membersForSearch
    .filter(
      includeDependents
        ? m => regex.test(m.filterKey)
        : m => m.role === "employee" && regex.test(m.filterKey)
    )
    .slice(0, maxResults)
    // Sort by role, then alphabetically
    .sort((a, b) => {
      const sortOrder = ["employee", "spouse", "domestic partner", "child"];
      const role = sortOrder.indexOf(a.role) - sortOrder.indexOf(b.role);
      if (role !== 0) {
        return role;
      }
      return a.filterKey.localeCompare(b.filterKey);
    });

  // Filter tools
  const toolsSearchResults: (U & { filterKey: string })[] = searchTools(
    searchableToolsURLDescriptors,
    query,
    regex
  );

  return [memberSearchResults, toolsSearchResults];
}

function searchTools<U extends { name: string; searchTags: string }>(
  searchableToolsURLDescriptors: U[],
  term: string,
  regex: RegExp
) {
  // The lower the priority the higher the result should show up
  const resultsWithPriority: [number, U & { filterKey: string }][] = [];

  for (const tool of searchableToolsURLDescriptors) {
    const nameAndTags = `${tool.name}, ${tool.searchTags}`.split(", ");
    const matchedTagNoMisspellings = nameAndTags.find(t => regex.test(t));
    if (matchedTagNoMisspellings != null) {
      if (matchedTagNoMisspellings === tool.name) {
        resultsWithPriority.push([
          0,
          { ...tool, filterKey: matchedTagNoMisspellings }
        ]);
      } else {
        resultsWithPriority.push([
          1,
          { ...tool, filterKey: matchedTagNoMisspellings }
        ]);
      }
    } else {
      // Originally I was concernced of the performance implications of
      //  one callback in every every iteration of this outer loop,
      // and another one per iteration of the inner loop of `.every`.
      // So I did this: https://jsperf.com/function-allocation-inside-of-loop/1
      // Also: https://jsben.ch/gjeA2
      // Not concerned anymore.
      for (const nameAndTag of nameAndTags) {
        const searchWords = term.trim().split(" ");

        const allSearchWordsHaveAcceptableDistance = searchWords.every(
          searchWord => {
            const minimumWordLength = 5;
            if (searchWord.length < minimumWordLength) {
              return false;
            }

            const levenshteinDistanceThreshold = 2;
            const hasOneTagWithAllowedDistance = nameAndTag
              .split(" ")
              .some(
                t =>
                  levenshtein(t.toLowerCase(), searchWord.toLowerCase()) <=
                  levenshteinDistanceThreshold
              );
            // If we needed to optimize, we could remove the nameAndTag
            // that matched here so that when we iterate again to compare
            // the next search word, we do not compare the same tag twice.
            // This will have one slight difference in the output since
            // repeating the same word in the input will not match an
            // item that doesn't have that tag the same amount of times
            // (e.g. "demographic demographic" would not match an item
            // that only has the word "demographic" once in the tags).
            //
            // I'm not going to do that though since there's always a very
            // small amount of tags for each item so the performance improvement
            // would be undetectable and would complicate the code needlessly.
            return hasOneTagWithAllowedDistance;
          }
        );
        if (allSearchWordsHaveAcceptableDistance) {
          if (nameAndTag === tool.name) {
            resultsWithPriority.push([2, { ...tool, filterKey: nameAndTag }]);
          } else {
            resultsWithPriority.push([3, { ...tool, filterKey: nameAndTag }]);
          }
          break;
        }
      }
    }
  }

  const results = resultsWithPriority
    .sort(([a, _], [b, __]) => a - b)
    .map(([_priority, tool]) => tool);

  return results;
}
