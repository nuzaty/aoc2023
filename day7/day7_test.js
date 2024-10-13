import { readLines, spiltWith, spiltWithSpace } from '../src/utils.js';
import util from 'util';

export async function day7_test() {
  const input = [];
  let lineNum = 1;
  for await (const line of readLines('./day7/input_test.txt')) {
    input.push({ lineNum, line });
    lineNum++;
  }

  console.log(input);

  input.sort((a, b) => a.line - b.line);
}
