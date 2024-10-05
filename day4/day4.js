import { readLines } from '../utils.mjs';
import util from 'util';

export async function day4() {
  let totalPoint = 0;

  for await (const line of readLines('./day4/input.txt')) {
    let token = line.split(':');
    const cardId = token[0];
    const twoListsOfnumbers = token[1];

    console.log('cardId', cardId);
    console.log('twoListsOfnumbers', twoListsOfnumbers);

    token = twoListsOfnumbers.split('|');
    const winningNumbers = token[0];
    const havingNumbers = token[1];

    console.log('winningNumbers', winningNumbers);
    console.log('havingNumbers', havingNumbers);

    let winningCount = 0;

    for (const winningNumber of winningNumbers.split(' ')) {
      if (winningNumber === '') continue;

      for (const havingNumber of havingNumbers.split(' ')) {
        if (havingNumber === '') continue;

        if (winningNumber === havingNumber) {
          console.log('winning!', winningNumber, havingNumber);
          winningCount++;
        }
      }
    }

    let point = 0;
    for (let i = 0; i < winningCount; i++) {
      if (point === 0) point = 1;
      else point *= 2;
    }

    totalPoint += point;

    console.log('winningCount', winningCount);
    console.log('point', point);
  }

  console.log('totalPoint', totalPoint);
}
