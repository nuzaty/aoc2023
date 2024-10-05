import fs from 'node:fs';
import readline from 'readline';

export function readLines(fileName) {
  const fileStream = fs.createReadStream(fileName);
  return readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
}

export function spiltWithSpace(str) {
  return str
    .split(' ')
    .map((item) => item.trim())
    .filter((item) => item);
}
