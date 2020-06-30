// https://github.com/reyronald/highlight-matches-utils/blob/master/LICENSE

/*
MIT License

Copyright (c) 2018 Ronald Rey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import React from "react";
import { match } from "fuzzaldrin-plus";

type SplitMatchesResult = Array<{
  isMatch: boolean;
  str: string;
}>;

export function splitMatches(
  text: string,
  matches: number[]
): SplitMatchesResult {
  const _matches = matches.slice(0);
  const result: SplitMatchesResult = [];
  for (let i = 0; i < text.length; i += 1) {
    const isMatch = i === _matches[0];
    if (isMatch) {
      _matches.shift();
    }

    const lastIndex = result.length - 1;
    if (lastIndex !== -1 && result[lastIndex].isMatch === isMatch) {
      result[lastIndex].str += text[i];
    } else {
      result.push({ str: text[i], isMatch: isMatch });
    }
  }
  return result;
}

export function highlightMatches<T>(
  text: string,
  matches: number[],
  matchesWrapper: (s: string, index: number, array: SplitMatchesResult) => T,
  noMatchesWrapper: (s: string, index: number, array: SplitMatchesResult) => T
): Array<T> {
  if (matches.length === 0) {
    return [noMatchesWrapper(text, 0, [])];
  }

  const splitMatchesResult = splitMatches(text, matches);
  const result = splitMatchesResult.map(function(r, i, a) {
    return r.isMatch
      ? matchesWrapper(r.str, i, a)
      : noMatchesWrapper(r.str, i, a);
  });

  return result;
}

export function highlightChars<T>(
  text: string,
  chars: string,
  matchesWrapper: (s: string, index: number, array: SplitMatchesResult) => T,
  noMatchesWrapper: (s: string, index: number, array: SplitMatchesResult) => T
): Array<T> {
  const matches = match(text, chars);
  const result = highlightMatches(
    text,
    matches,
    matchesWrapper,
    noMatchesWrapper
  );
  return result;
}

export function highlightNodes(text: string, chars: string) {
  return highlightChars<React.ReactNode>(
    text,
    chars,
    (s, i) => <mark key={i}>{s}</mark>,
    s => s
  );
}
