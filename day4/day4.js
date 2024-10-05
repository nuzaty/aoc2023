import { readLines } from '../utils.mjs';
import util from 'util';

export async function day4() {
  // Part 1
  let totalPoint = 0;
  let winningInfo = {};

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

    const cardIdNum = cardId.split(/[ ]+/)[1];
    winningInfo[cardIdNum] = winningCount;

    totalPoint += point;

    console.log('winningCount', winningCount);
    console.log('point', point);
  }

  console.log('totalPoint', totalPoint);

  console.log('---END PART 1---');

  // Part 2
  console.log('winningInfo', winningInfo);

  let totalCardsByCardId = {}; // including both original and copies

  for (const [cardId, winningCount] of Object.entries(winningInfo)) {
    const cardIdNum = Number(cardId);

    // add original
    if (totalCardsByCardId.hasOwnProperty(cardIdNum)) {
      totalCardsByCardId[cardIdNum]++;
      console.log('[original] add to', cardIdNum, 'by', 1, 'card(s) from cardId', cardId);
    } else {
      totalCardsByCardId[cardIdNum] = 1;
      console.log('[original] set to', cardIdNum, 'by', 1, 'card(s) from cardId', cardId);
    }

    const currentIdTotalCard = totalCardsByCardId.hasOwnProperty(cardIdNum)
      ? totalCardsByCardId[cardIdNum]
      : 1;

    const totalCardToAdd = 1 * currentIdTotalCard;
    console.log('totalCardToAdd', totalCardToAdd, 'of id', cardIdNum, 'to next', winningCount);
    console.log('totalCardsByCardId', totalCardsByCardId);

    // add copies
    for (let i = 1; i <= winningCount; i++) {
      if (totalCardsByCardId.hasOwnProperty(cardIdNum + i)) {
        totalCardsByCardId[cardIdNum + i] += totalCardToAdd;
        console.log('add to', cardIdNum + i, 'by', totalCardToAdd, 'card(s) from cardId', cardId);
      } else {
        totalCardsByCardId[cardIdNum + i] = totalCardToAdd;
        console.log('set to', cardIdNum + i, 'by', totalCardToAdd, 'card(s) from cardId', cardId);
      }
    }
  }
  console.log('totalCardsByCardId', totalCardsByCardId);

  const maxCardId = Object.keys(winningInfo).length;
  let totalCards = 0;
  for (const [cardId, cardCount] of Object.entries(totalCardsByCardId)) {
    if (Number(cardId) <= maxCardId) {
      totalCards += cardCount;
      //   console.log('totalCards changed', totalCards);
    } else {
      console.log('skipped', cardId);
    }
  }
  console.log('totalCards', totalCards);
}
