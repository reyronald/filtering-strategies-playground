import React from "react";
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

const searchableToolsURLDescriptorsWithFilterKey = searchableToolsURLDescriptors.map(
  u => ({
    ...u,
    filterKey: u.name + ", " + u.searchTags
  })
);

export function FuzzaldrinPlus({ value }) {
  const membersFiltered = fuzzaldrinPlus.filter(members, value, {
    key: "filterKey"
  });
  const toolsFiltered = fuzzaldrinPlus.filter(
    searchableToolsURLDescriptorsWithFilterKey,
    value,
    { key: "filterKey" }
  );

  return (
    <Results
      key={value}
      membersFiltered={membersFiltered}
      toolsFiltered={toolsFiltered}
      value={value}
    />
  );
}
