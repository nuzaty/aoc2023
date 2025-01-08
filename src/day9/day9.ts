import {readLines, spiltWithSpace} from '../utils';
import util from 'util';

export default async function (isPart1: boolean): Promise<number> {
    const sequences: number[][] = [];

    // step1: read file
    for await (const line of readLines('./src/day9/input.txt')) {
        const sequence = spiltWithSpace(line);
        sequences.push(sequence.map(el => Number(el)));
    }
    console.log('sequences', sequences);

    const rootSeqs = [];

    // step2: find diff seq
    for (const sequence of sequences) {
        const rootSeq: {seq: number[]; allDiffSeq: number[][]} = {
            seq: sequence,
            allDiffSeq: [],
        };

        let seqObj: {seq: number[]} = rootSeq;
        let diffSeq: {seq: number[]};

        do {
            diffSeq = {seq: []};

            let curEl = seqObj.seq[0]; // assume length is always > 0
            for (let i = 1; i < seqObj.seq.length; i++) {
                const nextEl = seqObj.seq[i];
                const diff = nextEl - curEl;
                diffSeq.seq.push(diff);
                curEl = nextEl;
            }
            rootSeq.allDiffSeq.push(diffSeq.seq);

            seqObj = diffSeq;
        } while (!diffSeq.seq.every(el => el === 0));

        rootSeq.allDiffSeq = rootSeq.allDiffSeq.reverse();

        console.log(
            'rootSeq',
            util.inspect(rootSeq, {
                showHidden: false,
                depth: null,
                colors: true,
            }),
        );

        rootSeqs.push(rootSeq);
    }

    // step3: process diff seq
    let sumOfExtrapolatedValPart1 = 0;
    let sumOfExtrapolatedValPart2 = 0;

    for (const rootSeq of rootSeqs) {
        const seqWithExtrapolatedVal = [
            ...rootSeq.allDiffSeq,
            rootSeq.seq,
        ].reduce((prev, cur) => {
            if (prev.length > 0 && cur.length > 0) {
                // part1
                const lastPrev = prev[prev.length - 1];
                const lastCur = cur[cur.length - 1];
                const part1NewEl = lastCur + lastPrev;

                // part2
                const firstPrev = prev[0];
                const firstCur = cur[0];
                const part2NewEl = firstCur - firstPrev;

                const newSeq = [part2NewEl, ...cur, part1NewEl];

                return newSeq;
            }
            throw new Error("No, that's impossible.");
        });

        sumOfExtrapolatedValPart1 +=
            seqWithExtrapolatedVal[seqWithExtrapolatedVal.length - 1];
        sumOfExtrapolatedValPart2 += seqWithExtrapolatedVal[0];
    }
    console.log('sumOfExtrapolatedValPart1', sumOfExtrapolatedValPart1);
    if (isPart1) return sumOfExtrapolatedValPart1;
    console.log('sumOfExtrapolatedValPart2', sumOfExtrapolatedValPart2);
    return sumOfExtrapolatedValPart2;
}
