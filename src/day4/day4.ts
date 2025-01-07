import {readLines} from '../utils';

export default async function (isPart1: boolean): Promise<number> {
    // Part 1
    let totalPoint = 0;
    const winningInfo = new Map<string, number>();

    for await (const line of readLines('./src/day4/input.txt')) {
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
        winningInfo.set(cardIdNum, winningCount);

        totalPoint += point;

        console.log('winningCount', winningCount);
        console.log('point', point);
    }

    console.log('totalPoint', totalPoint);

    console.log('---END PART 1---');
    if (isPart1) return totalPoint;

    // Part 2
    console.log('winningInfo', winningInfo);

    const totalCardsByCardId = new Map<string, number>(); // including both original and copies

    for (const [cardId, winningCount] of winningInfo.entries()) {
        // add original
        if (totalCardsByCardId.has(cardId)) {
            totalCardsByCardId.set(cardId, totalCardsByCardId.get(cardId)! + 1);
            console.log(
                '[original] add to',
                cardId,
                'by',
                1,
                'card(s) from cardId',
                cardId,
            );
        } else {
            totalCardsByCardId.set(cardId, 1);
            console.log(
                '[original] set to',
                cardId,
                'by',
                1,
                'card(s) from cardId',
                cardId,
            );
        }

        const currentIdTotalCard = totalCardsByCardId.has(cardId)
            ? totalCardsByCardId.get(cardId)!
            : 1;

        const totalCardToAdd = 1 * currentIdTotalCard;
        console.log(
            'totalCardToAdd',
            totalCardToAdd,
            'of id',
            cardId,
            'to next',
            winningCount,
        );
        console.log('totalCardsByCardId', totalCardsByCardId);

        // add copies
        for (let i = 1; i <= winningCount; i++) {
            const cardIdNum = +cardId;
            const key = String(cardIdNum + i);
            if (totalCardsByCardId.has(key)) {
                totalCardsByCardId.set(
                    key,
                    totalCardsByCardId.get(key)! + totalCardToAdd,
                );
                console.log(
                    'add to',
                    cardIdNum + i,
                    'by',
                    totalCardToAdd,
                    'card(s) from cardId',
                    cardId,
                );
            } else {
                totalCardsByCardId.set(key, totalCardToAdd);
                console.log(
                    'set to',
                    cardIdNum + i,
                    'by',
                    totalCardToAdd,
                    'card(s) from cardId',
                    cardId,
                );
            }
        }
    }
    console.log('totalCardsByCardId', totalCardsByCardId);

    const maxCardId = winningInfo.size;
    let totalCards = 0;
    for (const [cardId, cardCount] of totalCardsByCardId.entries()) {
        if (Number(cardId) <= maxCardId) {
            totalCards += cardCount;
            // console.log('totalCards changed', totalCards);
        } else {
            console.log('skipped', cardId);
        }
    }
    console.log('totalCards', totalCards);
    return totalCards;
}
