import fs from 'node:fs';
import readline from 'readline';

export function readLines(fileName: string) {
  const fileStream = fs.createReadStream(fileName);
  return readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
}

export function spiltWith(delimiter: string, str: string) {
  return str
    .split(delimiter)
    .map((item) => item.trim())
    .filter((item) => item);
}

export function spiltWithSpace(str: string) {
  return str
    .split(' ')
    .map((item) => item.trim())
    .filter((item) => item);
}