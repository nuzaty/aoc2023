/* eslint-disable n/no-process-exit */
import day1 from './day1/day1';
import day2 from './day2/day2';
import day3 from './day3/day3';
import day4 from './day4/day4';
import day5 from './day5/day5';
import day6 from './day6/day6';
import day7 from './day7/day7';
import day8 from './day8/day8';
import day9 from './day9/day9';
import day10 from './day10/day10';
import day11 from './day11/day11';
import day12 from './day12/day12';
import day13 from './day13/day13';
import day14 from './day14/day14';
import day15 from './day15/day15';
import day16 from './day16/day16';
import day17 from './day17/day17';
import day18 from './day18/day18';
import day19 from './day19/day19';
import day20 from './day20/day20';
import day21 from './day21/day21';
import day22 from './day22/day22';
import day23 from './day23/day23';
import day24 from './day24/day24';
import day25 from './day25/day25';
import {strictEqual} from 'assert';

const args = process.argv.slice(2);
if (args.length !== 2) {
    throw new Error('bad arguments (please select a day and a part)');
}

const selectedDay = args[0];
const selectedPart = args[1];
let isPart1;
if (selectedPart === '1') isPart1 = true;
else if (selectedPart === '2') isPart1 = false;
else throw new Error('bad arguments (invalid part): ' + selectedPart);

type Day = [(isPart1: boolean) => Promise<number>, number, number?]; // num1, num2 for recheck the answer after refactoring
const days = new Map<string, Day>([
    ['1', [day1, 55447, 54706]],
    ['2', [day2, 2162, 72513]],
    ['3', [day3, 556367, 89471771]],
    ['4', [day4, 22897, 5095824]],
    ['5', [day5, 196167384, 125742456]],
    ['6', [day6, 741000, 38220708]],
    ['7', [day7, 252656917, 253499763]],
    ['8', [day8, 20777, 13289612809129]],
    ['9', [day9, 1939607039, 1041]],
    ['10', [day10, 6773, 493]],
    ['11', [day11, 9177603, 632003913611]],
    ['12', [day12, 7379, 7732028747925]],
    ['13', [day13, 35521, 34795]],
    ['14', [day14, 109755, 90928]],
    ['15', [day15, 517965, 267372]],
    ['16', [day16, 7884, 8185]],
    ['17', [day17, 758, 892]],
    ['18', [day18, 50603, 96556251590677]],
    ['19', [day19, 456651, 131899818301477]],
    ['20', [day20, 912199500, 237878264003759]],
    ['21', [day21, 3578, 594115391548176]],
    ['22', [day22, 501, 80948]],
    ['23', [day23, 2034, 6302]],
    ['24', [day24, 28174, 568386357876600]],
    ['25', [day25, 614655]],
]);

const day = days.get(selectedDay);

if (day) {
    void (async () => {
        try {
            const ans = await day[0](isPart1);
            // check the answer
            strictEqual(ans, isPart1 ? day[1] : day[2]);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
        // force quit the process because z-solver is not terminating properly.
        process.exit(0);
    })();
} else {
    throw new Error('day not found: ' + selectedDay);
}
