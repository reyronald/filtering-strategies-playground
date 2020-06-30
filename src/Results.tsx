import React from "react";
import { highlightNodes } from "./highlight-matches-utils";

export function Results({
  membersFiltered,
  toolsFiltered,
  value
}: {
  membersFiltered: {
    id: string;
    nameLast: string;
    nameFirst: string;
    role: string;
    filterKey: string;
  }[];
  toolsFiltered: { name: string; filterKey: string }[];
  value: string;
}) {
  return (
    <>
      <p>{membersFiltered.length + toolsFiltered.length} total results</p>
      <p>{membersFiltered.length} member results</p>
      <ul>
        {membersFiltered.map(m => (
          <li key={m.id}>
            <b>{m.nameLast + ", " + m.nameFirst}</b> (tag:{" "}
            {highlightNodes(m.filterKey, value)})
            {m.role !== "employee" && (
              <>
                {" "}
                - {m.role === "child" && <i>👶 {m.role}</i>}
                {m.role !== "child" && <i>👰 {m.role}</i>}
              </>
            )}
          </li>
        ))}
      </ul>
      <hr />
      <p>{toolsFiltered.length} tool results</p>
      <ul>
        {toolsFiltered.map(t => (
          <li key={t.name}>
            <b>{t.name}</b> (tag: {highlightNodes(t.filterKey, value)})
          </li>
        ))}
      </ul>
    </>
  );
}
