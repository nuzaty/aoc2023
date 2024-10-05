import { readLines } from '../utils.mjs';
import util from 'util';

const isCharNumber = (c) => {
  return c >= '0' && c <= '9';
};

const isAdjacentSymbol = (numInfo, symbolInfos) => {
  const { coords: numCoords } = numInfo;
  for (const symbolInfo of symbolInfos) {
    const { x: symbolX, y: symbolY } = symbolInfo.coord;

    const adjacentCoords = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];

    for (const [x, y] of adjacentCoords) {
      for (const { x: numX, y: numY } of numCoords) {
        // console.log('checking adjacent...', symbolX, symbolY, numX, numY, x, y);
        if (symbolX - x === numX && symbolY - y === numY) {
          return true;
        }
      }
    }
  }
  return false;
};

export async function day3() {
  let currentNumText = '';
  let currentNumCoord = [];
  const numInfos = [];
  const symbolInfos = [];

  let x = 0;
  let y = 0;

  for await (const line of readLines('./day3/input.txt')) {
    function clearCurrentNumInfo() {
      currentNumText = '';
      currentNumCoord = [];
    }

    for (const char of line) {
      if (isCharNumber(char)) {
        currentNumText += char;
        currentNumCoord.push({ x, y });
      } else {
        if (currentNumText !== '') {
          numInfos.push({ num: Number(currentNumText), coords: currentNumCoord });
          clearCurrentNumInfo();
        }

        if (char !== '.') {
          symbolInfos.push({ symbol: char, coord: { x, y } });
        }
      }
      x++;
    }

    if (currentNumText !== '') {
      numInfos.push({ num: Number(currentNumText), coords: currentNumCoord });
    }
    clearCurrentNumInfo();
    y++;
    x = 0;
  }

  console.log('numInfos', util.inspect(numInfos, { showHidden: false, depth: null, colors: true }));
  console.log(
    'symbolInfos',
    util.inspect(symbolInfos, { showHidden: false, depth: null, colors: true })
  );

  // Part 1 Answer
  let sumOfPartNumbers = 0;
  for (const numInfo of numInfos) {
    if (isAdjacentSymbol(numInfo, symbolInfos)) {
      sumOfPartNumbers += numInfo.num;
      //   console.log('found a part number!', numInfo.num);
    } else {
      console.log('not a part number!', numInfo.num);
    }
  }
  console.log('total num', numInfos.length);
  console.log('sumOfPartNumbers', sumOfPartNumbers);

  //   console.log('--- test gon na ja ---');

  //   console.log(
  //     'isAdjacentSymbol',
  //     isAdjacentSymbol(
  //       {
  //         num: 12,
  //         coords: [
  //           { x: 0, y: 0 },
  //           { x: 1, y: 0 },
  //         ],
  //       },
  //       [{ symbol: '#', coord: { x: 0, y: 1 } }]
  //     )
  //   );

  // Part 2 Answer
  let sumOfGearRatio = 0;

  const starSymbols = symbolInfos.filter(({ symbol }) => symbol === '*');

  console.log(
    'starSymbol',
    util.inspect(starSymbols, { showHidden: false, depth: null, colors: true })
  );

  for (const starSymbol of starSymbols) {
    let adjacentNum = [];
    for (const numInfo of numInfos) {
      if (isAdjacentSymbol(numInfo, [starSymbol])) {
        adjacentNum.push(numInfo);
      }
    }

    // Check if it's a gear, the calculate gear ratio
    if (adjacentNum.length === 2) {
      sumOfGearRatio += adjacentNum[0].num * adjacentNum[1].num;
    }
  }

  console.log('sumOfGearRatio', sumOfGearRatio);
}
