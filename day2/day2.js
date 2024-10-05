import { readLines } from '../utils.mjs';

export async function day2() {
  let sumOfPowerOfPossibleBagConfig = 0;

  for await (const line of readLines('./day2/input.txt')) {
    const info = line.split(':');
    const gameIdInfo = info[0];
    const cubeSetsInfo = info[1];

    // console.log('gameIdInfo', gameIdInfo);
    // console.log('cubeSetInfo', cubeSetsInfo);
    // console.log('gameId', gameId);

    const gameId = Number(gameIdInfo.split(' ')[1].trim());
    const maxColorCount = {
      red: 0,
      green: 0,
      blue: 0,
    };

    const cubeSets = cubeSetsInfo.split(';');
    for (const cubeSet of cubeSets) {
      //   console.log('cubeSet', cubeSet);

      const colorInfo = cubeSet.trim().split(',');
      for (const eachColorInfo of colorInfo) {
        // console.log('eachColorInfo', eachColorInfo);

        const token = eachColorInfo.trim().split(' ');
        const count = Number(token[0].trim());
        const color = token[1].trim();

        console.log('count', count);
        console.log('color', color);

        if (count > maxColorCount[color]) {
          maxColorCount[color] = count;
          console.log('maxColorCount changed!', maxColorCount);
        }
      }
    }

    const powerOfPossibleBagConfig =
      maxColorCount['red'] * maxColorCount['green'] * maxColorCount['blue'];

    console.log('gameId', gameId);
    console.log('maxColorCount', maxColorCount);
    console.log('powerOfPossibleBagConfig', powerOfPossibleBagConfig);

    sumOfPowerOfPossibleBagConfig += powerOfPossibleBagConfig;
  }

  console.log('sumOfPowerOfPossibleBagConfig', sumOfPowerOfPossibleBagConfig);
}
