import React from "react";
import _ from "lodash";
import * as fuzzaldrinPlus from "fuzzaldrin-plus";

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

export function FuzzaldrinPlus2({ value }) {
  const membersFiltered = fuzzaldrinPlus.filter(members, value, {
    key: "filterKey"
  });

  const toolsFilteredNonUnique = fuzzaldrinPlus.filter(
    searchableToolsURLDescriptorsWithFilterKey,
    value,
    { key: "filterKey" }
  );

  const toolsFiltered = _.uniqBy(toolsFilteredNonUnique, t => t.name);

  return (
    <Results
      key={value}
      membersFiltered={membersFiltered}
      toolsFiltered={toolsFiltered}
      value={value}
    />
  );
}
