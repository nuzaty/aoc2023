import {readLines} from '../utils';

const part1BagConfig = {
    red: 12,
    green: 13,
    blue: 14,
};

export default async function (isPart1: boolean): Promise<number> {
    let sumOfPossibleGameId = 0;
    let sumOfPowerOfPossibleBagConfig = 0;

    for await (const line of readLines('./src/day2/input.txt')) {
        const info = line.split(':');
        const gameIdInfo = info[0];
        const cubeSetsInfo = info[1];

        // console.log('gameIdInfo', gameIdInfo);
        // console.log('cubeSetInfo', cubeSetsInfo);
        // console.log('gameId', gameId);

        const gameId = Number(gameIdInfo.split(' ')[1].trim());
        const maxColorCount: Record<string, number> = {
            red: 0,
            green: 0,
            blue: 0,
        };

        let isPossible = true;
        for (const cubeSet of cubeSetsInfo.split(';')) {
            //   console.log('cubeSet', cubeSet);
            const colorCount: Record<string, number> = {
                red: 0,
                green: 0,
                blue: 0,
            };

            const colorInfo = cubeSet.trim().split(',');
            for (const eachColorInfo of colorInfo) {
                // console.log('eachColorInfo', eachColorInfo);

                const token = eachColorInfo.trim().split(' ');
                const count = Number(token[0].trim());
                const color = token[1].trim();

                console.log('count', count);
                console.log('color', color);

                colorCount[color] = count;

                if (isPart1) {
                    if (
                        colorCount['red'] > part1BagConfig['red'] ||
                        colorCount['green'] > part1BagConfig['green'] ||
                        colorCount['blue'] > part1BagConfig['blue']
                    ) {
                        isPossible = false;
                        console.log('not possible!', gameId, cubeSet);
                    }
                }

                if (count > maxColorCount[color]) {
                    maxColorCount[color] = count;
                    console.log('maxColorCount changed!', maxColorCount);
                }
            }
        }

        const powerOfPossibleBagConfig =
            maxColorCount['red'] *
            maxColorCount['green'] *
            maxColorCount['blue'];

        console.log('gameId', gameId);
        console.log('maxColorCount', maxColorCount);
        console.log('powerOfPossibleBagConfig', powerOfPossibleBagConfig);

        sumOfPowerOfPossibleBagConfig += powerOfPossibleBagConfig;
        if (isPossible) sumOfPossibleGameId += gameId;
    }
    if (isPart1) {
        console.log('sumOfPossibleGameId', sumOfPossibleGameId);
        return sumOfPossibleGameId;
    }

    console.log('sumOfPowerOfPossibleBagConfig', sumOfPowerOfPossibleBagConfig);
    return sumOfPowerOfPossibleBagConfig;
}
