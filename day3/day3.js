import fs from 'node:fs';
import readline from 'readline';
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
  const fileStream = fs.createReadStream('./day3/input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let currentNumText = '';
  let currentNumCoord = [];
  const numInfos = [];
  const symbolInfos = [];

  let x = 0;
  let y = 0;

  for await (const line of rl) {
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
}
