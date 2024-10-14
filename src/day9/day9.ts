import { readLines, spiltWithSpace } from "../utils";
import util from 'util';


export async function day9() {
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
        const rootSeq: { seq: number[], allDiffSeq: number[][] } = { seq: sequence, allDiffSeq: [] };

        let seqObj: { seq: number[] } = rootSeq;
        let diffSeq: { seq: number[], diffSeq: any };

        do {
            diffSeq = { seq: [], diffSeq: {} };

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

        console.log('rootSeq', util.inspect(rootSeq, { showHidden: false, depth: null, colors: true }));

        rootSeqs.push(rootSeq);
    }

    // step3: process diff seq
    let sumOfExtrapolatedVal = 0;

    for (const rootSeq of rootSeqs) {
        const seqWithExtrapolatedVal = [...rootSeq.allDiffSeq, rootSeq.seq].reduce((prev, cur) => {
            if (prev.length > 0 && cur.length > 0) {
                const lastPrev = prev[prev.length - 1];
                const lastcur = cur[cur.length - 1];
                const newEl = lastcur + lastPrev;
                const newSeq = [...cur, newEl];
                console.log('newSeq', newSeq);
                return newSeq;
            }
            throw new Error('gu yung mai ru ja tum ngai d');
        })

        sumOfExtrapolatedVal += seqWithExtrapolatedVal[seqWithExtrapolatedVal.length - 1];
    }
    console.log('sumOfExtrapolatedVal', sumOfExtrapolatedVal);
}