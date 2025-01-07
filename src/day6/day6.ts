import {readLines, spiltWith, spiltWithSpace} from '../utils';

export default async function (isPart1: boolean): Promise<number> {
    let distanceData: string[] = [];
    let timeData: string[] = [];

    for await (const line of readLines('./src/day6/input.txt')) {
        const record = spiltWith(':', line);
        if (record[0] === 'Time') {
            timeData = spiltWithSpace(record[1]);
            //   console.log('timeData', timeData);
        } else if (record[0] === 'Distance') {
            distanceData = spiltWithSpace(record[1]);
            //   console.log('distanceData', distanceData);
        }
    }

    let realTotalTime = '';
    let realTotalDistance = '';
    let winCount = 1;

    for (let i = 0; i < timeData.length; i++) {
        const totalTime = +timeData[i];
        const recordDistance = +distanceData[i];
        console.log('totalTime', totalTime, 'recordDistance', recordDistance);

        realTotalTime += totalTime;
        realTotalDistance += recordDistance;

        if (isPart1) {
            let currWinCount = 0;
            for (let pressTime = 0; pressTime <= totalTime; pressTime++) {
                const calculatedDistance = pressTime * (totalTime - pressTime);
                console.log(
                    'pressTime',
                    pressTime,
                    'calculatedDistance',
                    calculatedDistance,
                );

                if (calculatedDistance > recordDistance) {
                    currWinCount++;
                }
            }

            winCount *= currWinCount;
        }
    }
    console.log('winCount', winCount);
    if (isPart1) return winCount;

    const realTotalTimeNum = Number(realTotalTime);
    const realTotalDistanceNum = Number(realTotalDistance);

    console.log(
        'realTotalTimeNum',
        realTotalTimeNum,
        'realTotalDistanceNum',
        realTotalDistanceNum,
    );

    winCount = 0;
    for (let pressTime = 0; pressTime <= realTotalTimeNum; pressTime++) {
        const calculatedDistance = pressTime * (realTotalTimeNum - pressTime);
        // console.log('pressTime', pressTime, 'calculatedDistance', calculatedDistance);

        if (calculatedDistance > realTotalDistanceNum) {
            winCount++;
        }
    }

    console.log('winCount', winCount);
    return winCount;
}
