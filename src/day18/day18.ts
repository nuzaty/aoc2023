import {Colors, getColorText, readLines, spiltWithSpace} from '../utils';

type Position = {
    x: number;
    y: number;
};

type DigInfo = {
    pos: Position;
    color: string;
};

function renderDigMap(
    digLocations: DigInfo[],
    floodLocations: Position[],
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
) {
    for (let y = yMin; y <= yMax; y++) {
        for (let x = xMin; x <= xMax; x++) {
            if (floodLocations.some(pos => pos.x === x && pos.y === y))
                process.stdout.write(getColorText('@', Colors.Blue));
            else if (digLocations.some(({pos}) => pos.x === x && pos.y === y))
                process.stdout.write(getColorText('#', Colors.Red));
            else process.stdout.write('.');
        }
        process.stdout.write('\n');
    }
}

function getNeighbors(
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    {x, y}: Position,
    digLocations: DigInfo[],
): Position[] {
    const neighbors: Position[] = [];

    if (x - 1 >= xMin) {
        neighbors.push({x: x - 1, y});
    }
    if (x + 1 <= xMax) {
        neighbors.push({x: x + 1, y});
    }
    if (y - 1 >= yMin) {
        neighbors.push({x, y: y - 1});
    }
    if (y + 1 <= yMax) {
        neighbors.push({x, y: y + 1});
    }

    return neighbors.filter(v => {
        const digLocation = digLocations.find(
            d => d.pos.x === v.x && d.pos.y === v.y,
        );
        return digLocation === undefined;
    });
}

export default async function () {
    // step 1 : read input into array
    const digLocations: DigInfo[] = []; // the first location is 0,0

    let xMin = 0;
    let xMax = 0;
    let yMin = 0;
    let yMax = 0;
    let x = 0;
    let y = 0;
    for await (const line of readLines('./src/day18/input.txt')) {
        const [direction, distance, color] = spiltWithSpace(line);
        const dtsNum = Number(distance);
        switch (direction) {
            case 'R':
                for (let i = 0; i < dtsNum; i++) {
                    x++;
                    digLocations.push({pos: {x, y}, color});
                }
                break;
            case 'L':
                for (let i = 0; i < dtsNum; i++) {
                    x--;
                    digLocations.push({pos: {x, y}, color});
                }
                break;
            case 'D':
                for (let i = 0; i < dtsNum; i++) {
                    y++;
                    digLocations.push({pos: {x, y}, color});
                }
                break;
            case 'U':
                for (let i = 0; i < dtsNum; i++) {
                    y--;
                    digLocations.push({pos: {x, y}, color});
                }
                break;
        }

        if (x > xMax) {
            xMax = x;
        } else if (x < xMin) {
            xMin = x;
        }

        if (y > yMax) {
            yMax = y;
        } else if (y < yMin) {
            yMin = y;
        }
    }

    console.log('digLocations', digLocations);
    console.log('xMax', xMax, 'yMax', yMax, 'xMin', xMin, 'yMin', yMin);

    // step 2: flood fill area & count area
    const startFlood = {x: 1, y: 1}; // assume area in pos (1,1);
    const floodLocations: Position[] = [startFlood];
    const floodQueue: Position[] = [startFlood];

    while (floodQueue.length > 0) {
        const flood = floodQueue.shift() as Position;
        let nextFloods = getNeighbors(
            xMin,
            xMax,
            yMin,
            yMax,
            flood,
            digLocations,
        );
        nextFloods = nextFloods.filter(v => {
            const found = floodLocations.find(f => f.x === v.x && f.y === v.y);
            return found === undefined;
        });
        floodQueue.push(...nextFloods);
        floodLocations.push(...nextFloods);
    }

    renderDigMap(digLocations, floodLocations, xMin, xMax, yMin, yMax);

    const totalCubicMeters = floodLocations.length + digLocations.length;

    console.log('floodLocations.length', floodLocations.length);
    console.log('digLocations.length', digLocations.length);
    console.log('totalCubicMeters', totalCubicMeters);
}
