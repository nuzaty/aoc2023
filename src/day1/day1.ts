import {readLines} from '../utils';

const isCharNumber = (c: string) => {
    return c >= '0' && c <= '9';
};

export default async function (isPart1: boolean): Promise<number> {
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

    for await (const line of readLines('./src/day1/input.txt')) {
        let firstDigit = '';
        let lastDigit = '';

        for (let i = 0; i < line.length; i++) {
            if (isCharNumber(line[i])) {
                if (firstDigit === '') firstDigit = line[i];
                lastDigit = line[i];
            } else if (!isPart1) {
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

                            if (subStr === engText) {
                                isEngTextFound = true;
                                engTextVal = +val;
                            }
                            break;
                        }
                    }

                    if (isEngTextFound) {
                        if (firstDigit === '') firstDigit = String(engTextVal);
                        lastDigit = String(engTextVal);
                        break;
                    }

                    if (isFound) {
                        searchPos++;
                        if (i + searchPos < line.length) {
                            subStr += line[i + searchPos];
                        } else break;
                    }
                } while (isFound);
            }
        }

        sum += +(firstDigit! + lastDigit);
    }
    console.log('sum', sum);
    return sum;
}
