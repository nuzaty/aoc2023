import fs from 'node:fs';
import readline from 'readline';

export async function day2() {
  const fileStream = fs.createReadStream('./day2/input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const bagConfig = {
    red: 12,
    green: 13,
    blue: 14,
  };

  let sumOfPossibleGameId = 0;

  for await (const line of rl) {
    const info = line.split(':');
    const gameIdInfo = info[0];
    const cubeSetsInfo = info[1];

    // console.log('gameIdInfo', gameIdInfo);
    // console.log('cubeSetInfo', cubeSetsInfo);

    const gameId = Number(gameIdInfo.split(' ')[1].trim());
    // console.log('gameId', gameId);

    let isPossible = true;

    const cubeSets = cubeSetsInfo.split(';');
    for (const cubeSet of cubeSets) {
      const colorCount = {
        red: 0,
        green: 0,
        blue: 0,
      };
      //   console.log('cubeSet', cubeSet);

      const colorInfo = cubeSet.trim().split(',');
      for (const eachColorInfo of colorInfo) {
        // console.log('eachColorInfo', eachColorInfo);

        const token = eachColorInfo.trim().split(' ');
        const count = token[0].trim();
        const color = token[1].trim();

        // console.log('count', count);
        // console.log('color', color);

        colorCount[color] = Number(count);
      }

      //   console.log('colorCount', colorCount);

      if (
        colorCount['red'] > bagConfig['red'] ||
        colorCount['green'] > bagConfig['green'] ||
        colorCount['blue'] > bagConfig['blue']
      ) {
        isPossible = false;
        console.log('not possible!', gameId, cubeSet);
        break;
      }
    }

    if (isPossible) sumOfPossibleGameId += gameId;
  }

  console.log('sumOfPossibleGameId', sumOfPossibleGameId);
}
