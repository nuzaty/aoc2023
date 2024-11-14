import {readLines, spiltWith} from '../utils';

// naming from https://adventofcode.com/2023/day/19
export type PartRating = {
    x: number;
    m: number;
    a: number;
    s: number;
};

export type Workflow = {
    name: string;
    condRules: Rule[]; // conditional rule
    lastDest: string;
};

export type Rule = {
    ratingType: string; //x, m, a, s
    operator: string; // > or <
    count: number;
    dest: string; // next workflow or Accept (A) or Reject (R)
};

export type Range = {
    min: number;
    max: number;
};

export type RatingRange = {
    xRange: Range;
    mRange: Range;
    aRange: Range;
    sRange: Range;
    workflowName: string;
};

export function extractWorkflow(workflow: string): Workflow {
    const pattern = /(.+){(.*)}/;
    const matches = workflow.match(pattern) as string[];
    const ruleTokens = spiltWith(',', matches[2]);
    const lastRuleToken = ruleTokens.pop() as string;

    const condRules: Rule[] = [];
    for (const ruleToken of ruleTokens) {
        const token = spiltWith(':', ruleToken);
        const ratingType = token[0].slice(0, 1);
        const operator = token[0].slice(1, 2);
        const count = Number(token[0].slice(2));
        const dest = token[1];
        condRules.push({ratingType, operator, count, dest});
    }

    return {
        name: matches[1],
        condRules,
        lastDest: lastRuleToken,
    };
}

export function extractPartRating(rating: string): PartRating {
    const pattern = /{x=(\d+),m=(\d+),a=(\d+),s=(\d+)}/;
    const matches = rating.match(pattern) as string[];
    return {
        x: Number(matches[1]),
        m: Number(matches[2]),
        a: Number(matches[3]),
        s: Number(matches[4]),
    };
}

async function readInput(): Promise<[Map<string, Workflow>, PartRating[]]> {
    const workflows = new Map<string, Workflow>();
    const partRatings: PartRating[] = [];
    let isWorkflow = true;
    for await (const line of readLines('./src/day19/input.txt')) {
        if (line) {
            if (isWorkflow) {
                const workflow = extractWorkflow(line);
                workflows.set(workflow.name, workflow);
            } else partRatings.push(extractPartRating(line));
        } else {
            isWorkflow = false;
        }
    }
    return [workflows, partRatings];
}

// return next workflow name or 'A' (Accept) or 'R' (Accept)
export function processWorkflowRule(
    part: PartRating,
    {ratingType, operator, count, dest}: Rule,
): string | undefined {
    let rating = -1;
    switch (ratingType) {
        case 'x':
            rating = part.x;
            break;
        case 'm':
            rating = part.m;
            break;
        case 'a':
            rating = part.a;
            break;
        case 's':
            rating = part.s;
            break;
    }
    if (operator === '>') {
        if (rating > count) {
            return dest;
        }
        return undefined;
    } else if (operator === '<') {
        if (rating < count) {
            return dest;
        }
        return undefined;
    } else {
        throw new Error('Unknown operator: ' + operator);
    }
}

function processWorkflowLastRule(
    {lastDest}: Workflow,
    workflows: Map<string, Workflow>,
): [boolean | undefined, Workflow | undefined] {
    if (lastDest === 'A') {
        return [true, undefined];
    } else if (lastDest === 'R') {
        return [false, undefined];
    } else {
        const nextWorkFlow = workflows.get(lastDest);
        if (nextWorkFlow) {
            return [undefined, nextWorkFlow];
        } else {
            throw new Error(
                'Part is not accepted or rejected and nextWorkFlow is not found!',
            );
        }
    }
}

function isPartAccepted(
    part: PartRating,
    workflows: Map<string, Workflow>,
): boolean {
    let currWorkflow = workflows.get('in') as Workflow;
    let isAccepted: boolean | undefined;
    let isProcess = true;

    // do unitl accept or rejected
    while (isProcess) {
        let nextWorkFlow: Workflow | undefined;
        let matchCondRule = false;

        // step 2.1 : check rules //

        for (const condRule of currWorkflow.condRules) {
            const nextWorkFlowName = processWorkflowRule(part, condRule);
            if (nextWorkFlowName) {
                // case: Accepted
                if (nextWorkFlowName === 'A') {
                    isAccepted = true;
                }
                // case: Rejected
                else if (nextWorkFlowName === 'R') {
                    isAccepted = false;
                }
                // case: go to next workflow
                else {
                    nextWorkFlow = workflows.get(nextWorkFlowName);
                }
                matchCondRule = true;
                break;
            }
            // else {
            //     // Go to next rule if not match any condition
            // }
        }

        // if not match any condition rule go to last rule (last destination)
        if (!matchCondRule) {
            const [lastIsAccept, lastNextWorkFlow] = processWorkflowLastRule(
                currWorkflow,
                workflows,
            );
            isAccepted = lastIsAccept;
            nextWorkFlow = lastNextWorkFlow;
        }

        // step 2.2 check if Accepted or Rejected and calculate sum of rating. otherwise go to next workflow. //

        // case go to next work flow
        if (nextWorkFlow) {
            currWorkflow = nextWorkFlow;
        }
        // case: Accepted or Rejected
        else {
            if (isAccepted === true || isAccepted === false) {
                isProcess = false;
            } else {
                throw new Error(
                    'Part is not accepted or rejected and nextWorkFlow is not found!',
                );
            }
        }
    }
    return isAccepted as boolean;
}

export function processRatingRange(
    ratingRange: RatingRange,
    workflow: Workflow,
): RatingRange[] {
    const {condRules} = workflow;
    const newRanges: RatingRange[] = [];
    let currRatingRange: RatingRange | undefined = ratingRange;
    for (const condRule of condRules) {
        if (currRatingRange) {
            const [ratingRangeToDest, ratingRangeRemain] = splitRatingRange(
                currRatingRange,
                condRule,
            );
            if (ratingRangeToDest) newRanges.push(ratingRangeToDest);
            currRatingRange = ratingRangeRemain;
        }
    }
    // add last remaining range to last dest
    if (currRatingRange) {
        currRatingRange.workflowName = workflow.lastDest;
        newRanges.push(currRatingRange);
    }

    return newRanges;
}

// [ratingRangeToDest, ratingRangeRemain]
export function splitRatingRange(
    ratingRange: RatingRange,
    rule: Rule,
): (RatingRange | undefined)[] {
    const {ratingType, operator, count, dest} = rule;
    const {xRange, mRange, aRange, sRange} = ratingRange;

    switch (ratingType) {
        case 'x': {
            const [xRangeToDest, xRangeRemain] = splitRangeWithCondNum(
                xRange,
                operator,
                count,
            );
            return [
                xRangeToDest
                    ? {
                          ...ratingRange,
                          xRange: xRangeToDest,
                          workflowName: dest,
                      }
                    : undefined,
                xRangeRemain
                    ? {
                          ...ratingRange,
                          xRange: xRangeRemain,
                      }
                    : undefined,
            ];
        }
        case 'm': {
            const [mRangeToDest, mRangeRemain] = splitRangeWithCondNum(
                mRange,
                operator,
                count,
            );
            return [
                mRangeToDest
                    ? {
                          ...ratingRange,
                          mRange: mRangeToDest,
                          workflowName: dest,
                      }
                    : undefined,
                mRangeRemain
                    ? {
                          ...ratingRange,
                          mRange: mRangeRemain,
                      }
                    : undefined,
            ];
        }
        case 'a': {
            const [aRangeToDest, aRangeRemain] = splitRangeWithCondNum(
                aRange,
                operator,
                count,
            );
            return [
                aRangeToDest
                    ? {
                          ...ratingRange,
                          aRange: aRangeToDest,
                          workflowName: dest,
                      }
                    : undefined,
                aRangeRemain
                    ? {
                          ...ratingRange,
                          aRange: aRangeRemain,
                      }
                    : undefined,
            ];
        }
        case 's': {
            const [sRangeToDest, sRangeRemain] = splitRangeWithCondNum(
                sRange,
                operator,
                count,
            );
            return [
                sRangeToDest
                    ? {
                          ...ratingRange,
                          sRange: sRangeToDest,
                          workflowName: dest,
                      }
                    : undefined,
                sRangeRemain
                    ? {
                          ...ratingRange,
                          sRange: sRangeRemain,
                      }
                    : undefined,
            ];
        }
        default:
            throw new Error('Unknown ratingType: ' + ratingType);
    }
}

// return [rangeToDest, rangeRemain]
export function splitRangeWithCondNum(
    {min, max}: Range,
    operator: string,
    condNum: number,
): (Range | undefined)[] {
    if (operator === '>') {
        if (min > condNum) {
            return [{min, max}, undefined];
        } else if (max <= condNum) {
            return [undefined, {min, max}];
        } else {
            return [
                {min: condNum + 1, max},
                {min, max: condNum},
            ];
        }
    } else {
        if (max < condNum) {
            return [{min, max}, undefined];
        } else if (min >= condNum) {
            return [undefined, {min, max}];
        } else {
            return [
                {min, max: condNum - 1},
                {min: condNum, max},
            ];
        }
    }
}

export default async function () {
    const isPart1 = false;

    // step 1: read input
    const [workflows, partRatings] = await readInput();

    if (isPart1) {
        // step 2 (PART 1): find accept part by workflows & part ratings
        let sumRating = 0;
        for (const part of partRatings) {
            const isAccepted = isPartAccepted(part, workflows);
            if (isAccepted) {
                sumRating += part.x;
                sumRating += part.m;
                sumRating += part.a;
                sumRating += part.s;
            }
        }
        console.log('sumRating', sumRating);
    } else {
        // step 2 (PART 2): find possible combinations of ratings will be accepted
        const startProcess: RatingRange = {
            xRange: {min: 1, max: 4000},
            mRange: {min: 1, max: 4000},
            aRange: {min: 1, max: 4000},
            sRange: {min: 1, max: 4000},
            workflowName: 'in',
        };
        const processQueue: RatingRange[] = [startProcess];
        const acceptedRanges: RatingRange[] = [];

        while (processQueue.length > 0) {
            const currRatingRange = processQueue.pop() as RatingRange;
            const workflow = workflows.get(
                currRatingRange.workflowName,
            ) as Workflow;
            const newRanges = processRatingRange(currRatingRange, workflow);

            for (const range of newRanges) {
                if (range.workflowName === 'A') {
                    acceptedRanges.push(range);
                } else if (range.workflowName === 'R') {
                    // do nothing if range is rejected
                } else {
                    processQueue.push(range);
                }
            }
        }

        // calculate all possible combination from all accepted ranges
        let totalCombination = 0;
        for (const {xRange, mRange, aRange, sRange} of acceptedRanges) {
            const xCount = xRange.max - xRange.min + 1;
            const mCount = mRange.max - mRange.min + 1;
            const aCount = aRange.max - aRange.min + 1;
            const sCount = sRange.max - sRange.min + 1;
            totalCombination += xCount * mCount * aCount * sCount;
        }

        console.log('totalCombination', totalCombination);
    }
}
