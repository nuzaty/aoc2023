import { readLines } from '../utils.mjs';

export async function day1() {
  const numberMap = {
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
  };

  let sum = 0;

  //   let count = 0;

  for await (const line of readLines('./day1/input.txt')) {
    let firstDigit = undefined;
    let lastDigit = undefined;

    for (let i = 0; i < line.length; i++) {
      //   console.log('line[i]', line[i]);

      if (!isNaN(line[i])) {
        if (firstDigit === undefined) firstDigit = line[i];
        lastDigit = line[i];
      } else {
        let isFound = false;
        let isEngTextFound = false;
        let engTextVal = -1;
        let subStr = line[i];
        let searchPos = 0;

        do {
          isFound = false;
          // check if sub string is found in number map
          for (const [engText, val] of Object.entries(numberMap)) {
            if (engText.startsWith(subStr)) {
              isFound = true;

              //   console.log(`found ${subStr} in ${engText}`);

              if (subStr === engText) {
                isEngTextFound = true;
                engTextVal = val;
                // console.log('FullTextFound', subStr);
                // console.log('FullTextVal', engTextVal);
              }
              break;
            }
          }

          if (isEngTextFound) {
            // i += subStr.length - 1;
            if (firstDigit === undefined) firstDigit = engTextVal;
            lastDigit = engTextVal;
            break;
          }

          if (isFound) {
            searchPos++;
            if (i + searchPos < line.length) {
              subStr += line[i + searchPos];
              //   console.log('new subStr', subStr);
            } else break;
          }
        } while (isFound);
      }
    }

    sum += parseInt(firstDigit + lastDigit);

    // console.log('add', parseInt(firstDigit + lastDigit));
    // console.log('sum', sum);
    // console.log('---');
    // count++;

    // if (count === 5) break;
  }
  console.log('sum', sum);
}
