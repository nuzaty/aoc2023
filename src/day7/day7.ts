import {readLines, spiltWithSpace} from '../utils';

type LineData = {
    hand: string;
    point: number;
    handTypePoint: number;
    handPoint: number;
};

const getHandTypePoint = (hand: string, isPart1: boolean) => {
    const symbolCount = new Map<string, number>();
    for (const symbol of hand) {
        if (symbolCount.has(symbol)) {
            const existing = symbolCount.get(symbol)!;
            symbolCount.set(symbol, existing + 1);
        } else {
            symbolCount.set(symbol, 1);
        }
    }
    let maxCount = -1;
    let symbolOfMaxCount = '';
    for (const [symbol, frequency] of symbolCount.entries()) {
        if (frequency > maxCount) {
            if (isPart1 || symbol !== 'J') {
                maxCount = frequency;
                symbolOfMaxCount = symbol;
            }
        }
    }

    if (!isPart1) {
        const jokerFound = symbolCount.has('J');
        if (jokerFound) {
            if (maxCount === -1) {
                maxCount = 5;
            } else {
                const jokerCount = symbolCount.get('J')!;
                const existing = symbolCount.get(symbolOfMaxCount!)!;
                symbolCount.set(symbolOfMaxCount!, existing + jokerCount);
                maxCount += jokerCount;
            }
            symbolCount.delete('J');
        }
    }

    const objectLength = symbolCount.size;
    console.log(symbolCount, 'objectLength', objectLength);
    switch (maxCount) {
        case 5:
            // Five of a kind
            return 7;
        case 4:
            // Four of a kind
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
            throw new Error('wtf! impossible!, max count: ' + maxCount + ', ');
    }
};

const getHandPoint = (hand: string, isPart1: boolean) => {
    let pointOfCard;
    if (isPart1) {
        pointOfCard = new Map<string, number>([
            ['2', 2],
            ['3', 3],
            ['4', 4],
            ['5', 5],
            ['6', 6],
            ['7', 7],
            ['8', 8],
            ['9', 9],
            ['T', 10],
            ['J', 11],
            ['Q', 12],
            ['K', 13],
            ['A', 14],
        ]);
    } else {
        pointOfCard = new Map<string, number>([
            ['J', 1],
            ['2', 2],
            ['3', 3],
            ['4', 4],
            ['5', 5],
            ['6', 6],
            ['7', 7],
            ['8', 8],
            ['9', 9],
            ['T', 10],
            ['Q', 11],
            ['K', 12],
            ['A', 13],
        ]);
    }

    let totalPoint = 0;
    let multiplier = 1;
    for (let i = hand.length - 1; i >= 0; i--) {
        const symbol = hand[i];
        totalPoint += pointOfCard.get(symbol)! * multiplier;
        multiplier *= 14;
    }

    return totalPoint;
};

export default async function (isPart1: boolean): Promise<number> {
    const input = [];
    for await (const line of readLines('./src/day7/input.txt')) {
        const token = spiltWithSpace(line);
        const hand = token[0];
        const point = token[1];

        const handTypePoint = getHandTypePoint(hand, isPart1);

        const handPoint = getHandPoint(hand, isPart1);

        const lineData: LineData = {
            hand,
            point: +point,
            handTypePoint,
            handPoint,
        };

        input.push(lineData);
    }
    input.sort((o1, o2) => {
        return (
            o1.handTypePoint - o2.handTypePoint || o1.handPoint - o2.handPoint
        );
    });

    let totalWinnings = 0;
    let rank = 1;
    for (const data of input) {
        const addedPoint = data.point * rank;
        totalWinnings += addedPoint;
        console.log('data', data, 'addedPoint: ', addedPoint, 'rank: ', rank);
        rank++;
    }

    console.log('totalWinnings', totalWinnings);
    return totalWinnings;
}
