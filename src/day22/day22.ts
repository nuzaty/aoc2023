import {Colors, getColorText, readLines, spiltWith} from '../utils';
import util from 'util';

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

type Range = {
    min: number;
    max: number;
};

type RenderData = {
    xRange: Range;
    yRange: Range;
    zRange: Range;
};

export default async function () {
    const isPart1 = true;

    // step 1: read input
    const bricks: Brick[] = await readPuzzleInput();
    // console.log(bricks);

    console.log('before falling');
    const renderData = prepareRenderBrick(bricks);
    renderBrick(bricks, renderData);

    // step 2: simulate brick falling & find supporting bricks
    const supportingBrick = new Map<number, number[]>();

    // do from the lowest brick first
    bricks.sort((a, b) => a.minZ - b.minZ);

    for (const brick of bricks) {
        // console.log(brick.label + ' is processing...', 'z before:', brick.minZ);

        let falling = true;
        while (falling) {
            // try to push brick down
            pushBrickDown(brick);

            const zBricks = bricks.filter(
                b =>
                    brick.minZ >= b.start.z &&
                    brick.minZ <= b.end.z &&
                    b !== brick,
            );

            // console.log(
            //     'z to check overlaps count',
            //     zBricks.length,
            //     'at z = ',
            //     brick.minZ,
            // );

            const overlapBricks: number[] = [];

            for (const zBrick of zBricks) {
                const isOverlaps = isBrickOverlapsXY(brick, zBrick);

                if (isOverlaps) {
                    overlapBricks.push(zBrick.id);

                    // console.log(
                    //     brick.label + ' found overlaps with',
                    //     zBrick.label,
                    //     'at z =',
                    //     brick.minZ,
                    // );
                } else {
                    // console.log(
                    //     brick.label + ' no overlaps found with',
                    //     zBrick.label,
                    //     'at z =',
                    //     brick.minZ,
                    // );
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

        // console.log(brick.label + ' is processed', 'z after:', brick.minZ);
    }

    console.log('after falling');
    const renderDataNew = prepareRenderBrick(bricks);
    renderBrick(bricks, renderDataNew);

    console.log('supportingBrick.size', supportingBrick.size);

    // find bricks that are supporting other bricks only itself
    const supportingOnlyItselfCount: number = new Set(
        Array.from(supportingBrick.values())
            .filter(v => v.length === 1)
            .flat(),
    ).size;

    const safelyDisintegratedCount = bricks.length - supportingOnlyItselfCount;
    console.log(
        '[PART 1 Answer] safelyDisintegratedCount:',
        safelyDisintegratedCount,
    );

    console.log(
        'supportingOnlyItselfCount',
        supportingOnlyItselfCount,
        'bricks.length',
        bricks.length,
    );

    // step 3 : find bricks that are supporting other bricks only itself
    // for (const brick1 of bricks) {
    //     for (const brick2 of bricks) {
    //         if (brick1 !== brick2) {
    //             if (isBrickOverlaps(brick2, brick1, true)) {
    //                 console.log(
    //                     'bug detail!',
    //                     util.inspect(brick1, {depth: null}),
    //                     util.inspect(brick2, {depth: null}),
    //                 );
    //                 throw new Error(
    //                     'it has a bug! with ' +
    //                         brick1.id +
    //                         ',' +
    //                         brick2.id +
    //                         ' z1=' +
    //                         brick1.minZ +
    //                         ' z2=' +
    //                         brick2.minZ,
    //                 );
    //             }
    //         }
    //     }
    // }
}

function isBrickOverlaps(brick1: Brick, brick2: Brick) {
    for (let x1 = brick1.start.x; x1 <= brick1.end.x; x1++) {
        for (let y1 = brick1.start.y; y1 <= brick1.end.y; y1++) {
            for (let z1 = brick1.start.z; z1 <= brick1.end.z; z1++) {
                for (let x2 = brick2.start.x; x2 <= brick2.end.x; x2++) {
                    for (let y2 = brick2.start.y; y2 <= brick2.end.y; y2++) {
                        for (
                            let z2 = brick2.start.z;
                            z2 <= brick2.end.z;
                            z2++
                        ) {
                            if (x1 === x2 && y1 === y2 && z1 === z2) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
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

function prepareRenderBrick(bricks: Brick[]): RenderData {
    const xRange: Range = {min: Infinity, max: -Infinity};
    const yRange = {min: Infinity, max: -Infinity};
    const zRange = {min: Infinity, max: -Infinity};

    for (const brick of bricks) {
        xRange.min = Math.min(brick.start.x, xRange.min);
        xRange.max = Math.max(brick.end.x, xRange.max);
        yRange.min = Math.min(brick.start.y, yRange.min);
        yRange.max = Math.max(brick.end.y, yRange.max);
        zRange.min = Math.min(brick.start.z, zRange.min);
        zRange.max = Math.max(brick.end.z, zRange.max);
    }

    return {
        xRange,
        yRange,
        zRange,
    };
}

function renderBrick(bricks: Brick[], renderData: RenderData) {
    // convert brick array into two 2d array
    const xzPlane: string[][] = init2dPlane(
        renderData.xRange.max + 1,
        renderData.zRange.max + 1,
    );

    const yzPlane: string[][] = init2dPlane(
        renderData.yRange.max + 1,
        renderData.zRange.max + 1,
    );

    for (const brick of bricks) {
        // xz plane
        for (let z = brick.start.z; z <= brick.end.z; z++) {
            for (let x = brick.start.x; x <= brick.end.x; x++) {
                if (xzPlane[z][x] === '.')
                    xzPlane[z][x] = getColorText(
                        brick.label,
                        Colors[brick.labelColor as keyof typeof Colors],
                    );
                else xzPlane[z][x] = '?';
            }
        }
        // yz plane
        for (let z = brick.start.z; z <= brick.end.z; z++) {
            for (let y = brick.start.y; y <= brick.end.y; y++) {
                if (yzPlane[z][y] === '.')
                    yzPlane[z][y] = getColorText(
                        brick.label,
                        Colors[brick.labelColor as keyof typeof Colors],
                    );
                else yzPlane[z][y] = '?';
            }
        }
    }

    // render xz plane
    console.log('');

    // x-axis label
    for (let x = 0; x < xzPlane[0].length; x++) {
        if (x === Math.floor(xzPlane[0].length / 2)) {
            process.stdout.write('x');
        } else {
            process.stdout.write(' ');
        }
    }
    process.stdout.write('\n');
    // x-axis number
    for (let x = 0; x < xzPlane[0].length; x++) {
        process.stdout.write('' + x);
    }
    process.stdout.write('\n');

    for (let z = xzPlane.length - 1; z >= 0; z--) {
        for (let x = 0; x < xzPlane[0].length; x++) {
            process.stdout.write(xzPlane[z][x]);
        }
        process.stdout.write(' ' + z);
        if (z === Math.floor(xzPlane.length / 2)) {
            process.stdout.write(' z');
        }
        process.stdout.write('\n');
    }
    // render yz plane
    console.log('');
    // y-axis label
    for (let y = 0; y < yzPlane[0].length; y++) {
        if (y === Math.floor(yzPlane[0].length / 2)) {
            process.stdout.write('y');
        } else {
            process.stdout.write(' ');
        }
    }
    process.stdout.write('\n');
    // y-axis number
    for (let y = 0; y < yzPlane[0].length; y++) {
        process.stdout.write('' + y);
    }
    process.stdout.write('\n');

    for (let z = yzPlane.length - 1; z >= 0; z--) {
        for (let y = 0; y < yzPlane[0].length; y++) {
            process.stdout.write(yzPlane[z][y]);
        }
        process.stdout.write(' ' + z);
        if (z === Math.floor(yzPlane.length / 2)) {
            process.stdout.write(' z');
        }
        process.stdout.write('\n');
    }
}

function init2dPlane(width: number, height: number): string[][] {
    return new Array(height).fill('.').map(() => new Array(width).fill('.'));
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
