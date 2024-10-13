import { readLines, spiltWith, spiltWithSpace } from '../utils.mjs';
import util from 'util';

const getHandTypePoint = (hand) => {
  const symbolCount = {};
  for (const symbol of hand) {
    if (symbolCount.hasOwnProperty(symbol)) {
      symbolCount[symbol]++;
    } else {
      symbolCount[symbol] = 1;
    }
  }
  let maxCount = -1;
  for (const [, value] of Object.entries(symbolCount)) {
    if (value > maxCount) maxCount = value;
  }

  const objectLength = Object.keys(symbolCount).length;
  switch (maxCount) {
    case 5:
      // Five of a kind
      return 7;
    case 4:
      //Four of a kind
      return 6;
    case 3:
      // Full house or Three of a kind
      if (objectLength === 2) {
        // Full house
        return 5;
      } else {
        // Three of a kind
        return 4;
      }
    case 2:
      // Two pair or One pair
      if (objectLength === 3) {
        // Two pair
        return 3;
      } else {
        // One pair
        return 2;
      }
    case 1:
      return 1;

    default:
      throw new Error('wtf! impossible!');
  }

  if (maxCount === 5) {
  } else if (ex) console.log('symbolCount', symbolCount);
};

const getHandPoint = (hand) => {
  const pointOfCard = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    T: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };

  let totalPoint = 0;
  let multiplier = 1;
  for (let i = hand.length - 1; i >= 0; i--) {
    const symbol = hand[i];
    totalPoint += pointOfCard[symbol] * multiplier;
    multiplier *= 13;
  }

  return totalPoint;
};

export async function day7() {
  const input = [];
  for await (const line of readLines('./day7/input.txt')) {
    const token = spiltWithSpace(line);
    const hand = token[0];
    const point = token[1];

    const handTypePoint = getHandTypePoint(hand);
    console.log('handTypePoint', handTypePoint);

    const handPoint = getHandPoint(hand);
    console.log('handPoint', handPoint);

    input.push({ hand, point, handTypePoint, handPoint });
  }
  input.sort((o1, o2) => {
    return o1.handTypePoint - o2.handTypePoint || o1.handPoint - o2.handPoint;
  });

  let totalWinnings = 0;
  let rank = 1;
  for (const data of input) {
    totalWinnings += data.point * rank;
    rank++;
    console.log('data', data);
  }

  console.log('totalWinnings', totalWinnings);
}
