import {readLines} from '../utils';
import util from 'util';

type Coord = {
    x: number;
    y: number;
};

type NumInfo = {
    num: number;
    coords: Coord[];
};

type SymbolInfo = {
    symbol: string;
    coord: Coord;
};

const isCharNumber = (c: string) => {
    return c >= '0' && c <= '9';
};

const isAdjacentSymbol = (numInfo: NumInfo, symbolInfos: SymbolInfo[]) => {
    const {coords: numCoords} = numInfo;
    for (const symbolInfo of symbolInfos) {
        const {x: symbolX, y: symbolY} = symbolInfo.coord;

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
            for (const {x: numX, y: numY} of numCoords) {
                if (symbolX - x === numX && symbolY - y === numY) {
                    return true;
                }
            }
        }
    }
    return false;
};

export default async function (isPart1: boolean): Promise<number> {
    let currentNumText = '';
    let currentNumCoord = [];
    const numInfos: NumInfo[] = [];
    const symbolInfos: SymbolInfo[] = [];

    let x = 0;
    let y = 0;

    for await (const line of readLines('./src/day3/input.txt')) {
        const clearCurrentNumInfo = () => {
            currentNumText = '';
            currentNumCoord = [];
        };

        for (const char of line) {
            if (isCharNumber(char)) {
                currentNumText += char;
                currentNumCoord.push({x, y});
            } else {
                if (currentNumText !== '') {
                    numInfos.push({
                        num: Number(currentNumText),
                        coords: currentNumCoord,
                    });
                    clearCurrentNumInfo();
                }

                if (char !== '.') {
                    symbolInfos.push({symbol: char, coord: {x, y}});
                }
            }
            x++;
        }

        if (currentNumText !== '') {
            numInfos.push({
                num: Number(currentNumText),
                coords: currentNumCoord,
            });
        }
        clearCurrentNumInfo();
        y++;
        x = 0;
    }

    console.log(
        'numInfos',
        util.inspect(numInfos, {showHidden: false, depth: null, colors: true}),
    );
    console.log(
        'symbolInfos',
        util.inspect(symbolInfos, {
            showHidden: false,
            depth: null,
            colors: true,
        }),
    );

    // Part 1 Answer
    let sumOfPartNumbers = 0;
    for (const numInfo of numInfos) {
        if (isAdjacentSymbol(numInfo, symbolInfos)) {
            sumOfPartNumbers += numInfo.num;
        } else {
            console.log('not a part number!', numInfo.num);
        }
    }
    console.log('total num', numInfos.length);
    console.log('sumOfPartNumbers', sumOfPartNumbers);
    if (isPart1) return sumOfPartNumbers;

    // Part 2 Answer
    let sumOfGearRatio = 0;

    const starSymbols = symbolInfos.filter(({symbol}) => symbol === '*');

    console.log(
        'starSymbol',
        util.inspect(starSymbols, {
            showHidden: false,
            depth: null,
            colors: true,
        }),
    );

    for (const starSymbol of starSymbols) {
        const adjacentNum = [];
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
    return sumOfGearRatio;
}
