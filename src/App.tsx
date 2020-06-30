import React from "react";

import "./styles.css";

import { FuzzaldrinPlus } from "./FuzzaldrinPlus";
import { FuzzaldrinPlus2 } from "./FuzzaldrinPlus2";
import { ExactMatch } from "./ExactMatch";
import { MatchSorter } from "./MatchSorter";
import { MatchSorter2 } from "./MatchSorter2";
import { Levenshtein } from "./Levenshtein";
import { Final } from "./Final";

export default function App() {
  const [value, setValue] = React.useState("");
  return (
    <div className="App">
      <h1>Filtering strategies playground</h1>

      <label>
        <span>Search:</span>{" "}
        <input value={value} onChange={e => setValue(e.currentTarget.value)} />
      </label>

      <div className="results-container">
        <div>
          <h2>FuzzaldrinPlus</h2>
          <FuzzaldrinPlus value={value} />
        </div>
        <div>
          <h2>FuzzaldrinPlus2</h2>
          <FuzzaldrinPlus2 value={value} />
        </div>
        <div>
          <h2>MatchSorter</h2>
          <MatchSorter value={value} />
        </div>
        <div>
          <h2>Regex match + Levenshtein</h2>
          <ExactMatch value={value} version="one" />
        </div>
        <div>
          <h2>Regex match + Levenshtein 2</h2>
          <ExactMatch value={value} version="two" />
        </div>
        <div>
          <h2>Regex match + Levenshtein 3</h2>
          <ExactMatch value={value} version="three" />
        </div>
        <div>
          <h2>Regex match + Levenshtein 4</h2>
          <ExactMatch value={value} version="four" />
        </div>
        <div>
          <h2>Final</h2>
          <Final value={value} />
        </div>
      </div>
    </div>
  );
}
