import {Colors, readLines, spiltWith} from '../utils';

export type Point2D = {
    x: number;
    y: number;
};

type Coord = {
    x: number;
    y: number;
    z: number;
};

type Brick = {
    id: number;
    start: Coord;
    end: Coord;
    minZ: number;
    label: string;
    labelColor: string;
};

export type Line = {
    start: Point2D;
    end: Point2D;
};

export default async function (isPart1: boolean): Promise<number> {
    // step 1: read input
    const bricks: Brick[] = await readPuzzleInput();

    /** PART 1 **/
    // step 2: simulate brick falling & find supporting bricks
    const supportingBrick = new Map<number, number[]>();

    // do from the lowest brick first
    simulateFalling(bricks, supportingBrick);

    console.log('supportingBrick.size', supportingBrick.size);

    // find bricks that are supporting other bricks only itself
    const supportingOnlyItself = new Set(
        Array.from(supportingBrick.values())
            .filter(v => v.length === 1)
            .flat(),
    );

    const supportingOnlyItselfCount: number = supportingOnlyItself.size;

    const safelyDisintegratedCount = bricks.length - supportingOnlyItselfCount;
    console.log(
        '[PART 1 Answer] safelyDisintegratedCount:',
        safelyDisintegratedCount,
    );
    if (isPart1) return safelyDisintegratedCount;

    console.log(
        'supportingOnlyItselfCount',
        supportingOnlyItselfCount,
        'bricks.length',
        bricks.length,
    );

    /** PART 2 **/
    let totalFall = 0;
    let finishedCount = 0;

    for (const brickId of supportingOnlyItself) {
        const newBricks = bricks
            .filter(b => b.id !== brickId)
            .map(b => {
                return {...b, start: {...b.start}, end: {...b.end}};
            });

        totalFall += simulateFalling(newBricks, supportingBrick);

        finishedCount++;
        if (finishedCount % 10 === 0) {
            console.log(
                'brickId',
                brickId,
                'totalFall',
                totalFall,
                'finishedCount',
                finishedCount,
            );
        }
    }

    console.log('[PART 2 Answer] totalFall:', totalFall);
    return totalFall;
}

// return the number of other bricks that would fall
function simulateFalling(
    bricks: Brick[],
    supportingBrick: Map<number, number[]>,
): number {
    let fallenBrickCount = 0;

    bricks.sort((a, b) => a.minZ - b.minZ);

    for (const brick of bricks) {
        let falling = true;
        const oldZ = brick.minZ;
        while (falling) {
            // try to push brick down
            pushBrickDown(brick);

            const zBricks = bricks.filter(
                b =>
                    brick.minZ >= b.start.z &&
                    brick.minZ <= b.end.z &&
                    b !== brick,
            );

            const overlapBricks: number[] = [];

            for (const zBrick of zBricks) {
                const isOverlaps = isBrickOverlapsXY(brick, zBrick);

                if (isOverlaps) {
                    overlapBricks.push(zBrick.id);
                }
            }

            if (overlapBricks.length > 0) {
                pushBrickUp(brick);
                falling = false;

                supportingBrick.set(brick.id, overlapBricks);
            } else {
                if (brick.minZ <= 0) {
                    pushBrickUp(brick);
                    falling = false;

                    supportingBrick.set(brick.id, []);
                }
            }
        }
        if (oldZ !== brick.minZ) {
            fallenBrickCount++;
        }
    }

    return fallenBrickCount;
}

function isBrickOverlapsXY(brick1: Brick, brick2: Brick): boolean {
    let isOverlaps = false;

    const isBrick1Point = isBrickIsPoint(brick1);
    const isBrick2Point = isBrickIsPoint(brick2);

    if (isBrick1Point && isBrick2Point) {
        // both are point
        if (
            brick1.start.x === brick2.start.x &&
            brick1.start.y === brick2.start.y
        ) {
            isOverlaps = true;
        }
    } else if (!isBrick1Point && !isBrick2Point) {
        // both are line
        const isHorizCollinear =
            brick1.start.y === brick1.end.y &&
            brick1.start.y === brick2.start.y &&
            brick1.start.y === brick2.end.y;

        const isVertCollinear =
            brick1.start.x === brick1.end.x &&
            brick1.start.x === brick2.start.x &&
            brick1.start.x === brick2.end.x;

        if (isHorizCollinear || isVertCollinear) {
            isOverlaps = isAxisAlignedSegmentOverlap(
                brickToLine(brick1),
                brickToLine(brick2),
            );
        } else {
            const isBrick1HorizLine = brick1.start.y === brick1.end.y;
            if (isBrick1HorizLine) {
                isOverlaps = doAxisAlignedSegmentsIntersect(
                    brickToLine(brick2),
                    brickToLine(brick1),
                );
            } else {
                isOverlaps = doAxisAlignedSegmentsIntersect(
                    brickToLine(brick1),
                    brickToLine(brick2),
                );
            }
        }
    } else if (isBrick1Point && !isBrick2Point) {
        // brick is point but geometryBrick is line
        isOverlaps = isPointOnAxisAlignedLine(
            brickToLine(brick2),
            brickToPoint(brick1),
        );
    } else if (!isBrick1Point && isBrick2Point) {
        // brick is line but geometryBrick is point
        isOverlaps = isPointOnAxisAlignedLine(
            brickToLine(brick1),
            brickToPoint(brick2),
        );
    }
    return isOverlaps;
}

function isBrickIsPoint(brick: Brick): boolean {
    return brick.start.x === brick.end.x && brick.start.y === brick.end.y;
}

function brickToLine(brick: Brick): Line {
    return {
        start: {x: brick.start.x, y: brick.start.y},
        end: {x: brick.end.x, y: brick.end.y},
    };
}
function brickToPoint(brick: Brick): Point2D {
    return {
        x: brick.start.x,
        y: brick.start.y,
    };
}

function pushBrickDown(brick: Brick) {
    brick.start.z--;
    brick.end.z--;
    brick.minZ--;
}

function pushBrickUp(brick: Brick) {
    brick.start.z++;
    brick.end.z++;
    brick.minZ++;
}

async function readPuzzleInput(): Promise<Brick[]> {
    const bricks: Brick[] = [];

    const alphabet = [...Array(26).keys()].map(i =>
        String.fromCharCode(i + 65),
    );
    const colors: string[] = [];
    for (const colorVal in Colors) {
        if (isNaN(Number(colorVal))) {
            colors.push(colorVal);
        }
    }
    let alphabetIndex = 0;
    let colorIndex = 0;
    let brickId = 0;

    for await (const line of readLines('./src/day22/input.txt')) {
        const token = spiltWith('~', line);
        const startXYZ = spiltWith(',', token[0]).map(v => Number(v));
        const endXYZ = spiltWith(',', token[1]).map(v => Number(v));
        const minZ = Math.min(startXYZ[2], endXYZ[2]);

        bricks.push({
            id: brickId,
            start: {x: startXYZ[0], y: startXYZ[1], z: startXYZ[2]},
            end: {x: endXYZ[0], y: endXYZ[1], z: endXYZ[2]},
            minZ,
            label: alphabet[alphabetIndex],
            labelColor: colors[colorIndex],
        });
        brickId++;

        alphabetIndex++;
        if (alphabetIndex === alphabet.length) {
            colorIndex++;
            colorIndex = colorIndex % colors.length;
        }
        alphabetIndex = alphabetIndex % alphabet.length;
    }

    return bricks;
}

export function isPointOnAxisAlignedLine(line: Line, point: Point2D): boolean {
    const {start, end} = line;
    const {x, y} = point;

    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

export function isAxisAlignedSegmentOverlap(line1: Line, line2: Line): boolean {
    const isVertical =
        line1.start.x === line1.end.x && line2.start.x === line2.end.x;

    if (isVertical) {
        if (line1.start.x !== line2.start.x || line1.end.x !== line2.end.x)
            return false;

        return (
            Math.min(line1.start.y, line1.end.y) <=
                Math.max(line2.start.y, line2.end.y) &&
            Math.max(line1.start.y, line1.end.y) >=
                Math.min(line2.start.y, line2.end.y)
        );
    } else {
        return (
            Math.min(line1.start.x, line1.end.x) <=
                Math.max(line2.start.x, line2.end.x) &&
            Math.max(line1.start.x, line1.end.x) >=
                Math.min(line2.start.x, line2.end.x)
        );
    }
}

export function doAxisAlignedSegmentsIntersect(
    verticalLine: Line,
    horizontalLine: Line,
): boolean {
    const {start: vertStart, end: vertEnd} = verticalLine;
    const {start: horizStart, end: horizEnd} = horizontalLine;

    return (
        vertStart.x >= Math.min(horizStart.x, horizEnd.x) &&
        vertStart.x <= Math.max(horizStart.x, horizEnd.x) &&
        horizStart.y >= Math.min(vertStart.y, vertEnd.y) &&
        horizStart.y <= Math.max(vertStart.y, vertEnd.y)
    );
}
