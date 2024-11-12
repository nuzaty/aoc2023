import {Colors, getColorText, readLines, spiltWithSpace} from '../utils';

type Position = {
    x: number;
    y: number;
};

function renderDigMap(
    digVertices: Position[],
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
) {
    const cols = xMax - xMin + 1;
    const rows = yMax - yMin + 1;

    const xToCol = (x: number): number => {
        return x - xMin;
    };
    const yToRow = (y: number): number => {
        return y - yMin;
    };

    const tiles: string[][] = Array.from({length: rows}, () =>
        Array.from({length: cols}, () => '.'),
    );

    const digSymbol = getColorText('#', Colors.Red);

    const paintDigSymbol = (
        prevVertex: Position,
        {x: digX, y: digY}: Position,
    ) => {
        if (prevVertex) {
            if (prevVertex.x !== digX) {
                // case x shift
                if (prevVertex.x > digX) {
                    for (let x = prevVertex.x; x > digX; x--) {
                        tiles[yToRow(digY)][xToCol(x)] = digSymbol;
                    }
                } else {
                    for (let x = prevVertex.x; x < digX; x++) {
                        tiles[yToRow(digY)][xToCol(x)] = digSymbol;
                    }
                }
            } else {
                // case y shift
                if (prevVertex.y > digY) {
                    for (let y = prevVertex.y; y > digY; y--) {
                        tiles[yToRow(y)][xToCol(digX)] = digSymbol;
                    }
                } else {
                    for (let y = prevVertex.y; y < digY; y++) {
                        tiles[yToRow(y)][xToCol(digX)] = digSymbol;
                    }
                }
            }
        }
    };
    let prevVertex: Position | undefined;
    for (const digVertice of digVertices) {
        if (prevVertex) paintDigSymbol(prevVertex, digVertice);
        prevVertex = digVertice;
    }
    // handle case first and last vertices
    paintDigSymbol(digVertices[digVertices.length - 1], digVertices[0]);

    for (const row of tiles) {
        for (const colChar of row) {
            process.stdout.write(colChar);
        }
        process.stdout.write('\n');
    }
}

function findPolygonArea(points: Position[]): number {
    const n = points.length;
    let area = 0;
    for (let i = 0; i < n - 1; i++) {
        area += points[i].x * points[i + 1].y - points[i + 1].x * points[i].y;
    }
    area += points[n - 1].x * points[0].y - points[0].x * points[n - 1].y;
    area = Math.abs(area);
    return area / 2;
}

function findPerimeterLen(points: Position[]) {
    let prevPoint: Position | undefined;
    let length = 0;
    const findLength = (prevPoint: Position, point: Position): number => {
        if (point.x !== prevPoint.x) {
            return Math.abs(prevPoint.x - point.x);
        } else {
            return Math.abs(prevPoint.y - point.y);
        }
    };
    for (const point of points) {
        if (prevPoint) {
            length += findLength(prevPoint, point);
        }
        prevPoint = point;
    }
    // handle first and last length
    length += findLength(points[points.length - 1], points[0]);
    return length;
}

export default async function () {
    // step 1 : read input into array
    const digVertices: Position[] = [];

    let xMin = 0;
    let xMax = 0;
    let yMin = 0;
    let yMax = 0;
    // the first location is 0,0
    let x = 0;
    let y = 0;
    for await (const line of readLines('./src/day18/input.txt')) {
        const [direction, distance, color] = spiltWithSpace(line);
        const dtsNum = Number(distance);
        switch (direction) {
            case 'R':
                x += dtsNum;
                break;
            case 'L':
                x -= dtsNum;
                break;
            case 'D':
                y += dtsNum;
                break;
            case 'U':
                y -= dtsNum;
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

        digVertices.push({x, y});
    }

    console.log('digVertices', digVertices);
    console.log('xMax', xMax, 'yMax', yMax, 'xMin', xMin, 'yMin', yMin);

    // step 2: find area with The Shoelace Formula
    // ref: https://www.theoremoftheday.org/GeometryAndTrigonometry/Shoelace/TotDShoelace.pdf
    const innerArea = findPolygonArea(digVertices);
    const perimeterLen = findPerimeterLen(digVertices);
    const outerArea = perimeterLen / 2 + 1;
    const total = innerArea + outerArea;
    console.log('inner area', innerArea);
    console.log('perimeterLen', perimeterLen);
    console.log('oouterArea', outerArea);
    console.log('total', total);

    // renderDigMap(digVertices, xMin, xMax, yMin, yMax);
}
