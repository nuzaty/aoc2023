import {readLines, spiltWith} from '../utils';

type Stone = {
    id: number;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
};

type Intersection = {
    stoneId1: number;
    stoneId2: number;
    x: number;
    y: number;
    z?: number;
};

export default async function () {
    // step 1 : read input
    const stones = await readPuzzleInput();

    // step 2 : find all the future intersections with each stone
    const testAreaRange = [200000000000000, 400000000000000];
    const intersections: Intersection[] = [];

    for (let i = 0; i < stones.length - 1; i++) {
        for (let j = i + 1; j < stones.length; j++) {
            if (i === j) continue;

            const stoneA = stones[i];
            const stoneB = stones[j];

            // find the xy-slope of the trajectory of both stones
            const slopeA = stoneA.vy / stoneA.vx;
            const slopeB = stoneB.vy / stoneB.vx;

            // find the y-axis intercept of the trajectory of both stones with x,y position
            const interceptA = stoneA.y - slopeA * stoneA.x;
            const interceptB = stoneB.y - slopeB * stoneB.x;

            if (slopeA === slopeB) {
                // no intersection if the slope is equal (it'll parallel each other)
                continue;
            } else {
                // find the intersection point of the two trajectories
                const x = (interceptB - interceptA) / (slopeA - slopeB);
                const y = slopeA * x + interceptA;

                // check is the intersection point is in the future for both stones
                const diffXA = x - stoneA.x;
                const diffXB = x - stoneB.x;
                const isFuture =
                    diffXA * stoneA.vx > 0 && diffXB * stoneB.vx > 0;

                if (
                    isFuture &&
                    x >= testAreaRange[0] &&
                    x <= testAreaRange[1] &&
                    y >= testAreaRange[0] &&
                    y <= testAreaRange[1]
                ) {
                    intersections.push({
                        stoneId1: stoneA.id,
                        stoneId2: stoneB.id,
                        x,
                        y,
                    });
                }
            }
        }
    }

    console.log(intersections, intersections.length);
}

async function readPuzzleInput(): Promise<Stone[]> {
    const stones: Stone[] = [];
    let id = 0;
    for await (const line of readLines('./src/day24/input.txt')) {
        const token = spiltWith('@', line);
        const position = spiltWith(',', token[0]);
        const velocity = spiltWith(',', token[1]);

        stones.push({
            id,
            x: parseInt(position[0]),
            y: parseInt(position[1]),
            z: parseInt(position[2]),
            vx: parseInt(velocity[0]),
            vy: parseInt(velocity[1]),
            vz: parseInt(velocity[2]),
        });
        id++;
    }

    return stones;
}
