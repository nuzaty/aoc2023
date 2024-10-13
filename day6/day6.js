import { readLines, spiltWith, spiltWithSpace } from '../src/utils.js';
import util from 'util';

export async function day6() {
  let distanceData = [];
  let timeData = [];

  for await (const line of readLines('./day6/input.txt')) {
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
  //   let output = 1;

  for (let i = 0; i < timeData.length; i++) {
    const totalTime = timeData[i];
    const recordDistance = distanceData[i];
    console.log('totalTime', totalTime, 'recordDistance', recordDistance);

    realTotalTime += totalTime;
    realTotalDistance += recordDistance;

    // let winCount = 0;
    // for (let pressTime = 0; pressTime <= totalTime; pressTime++) {
    //   const calculatedDistance = pressTime * (totalTime - pressTime);
    //   console.log('pressTime', pressTime, 'calculatedDistance', calculatedDistance);

    //   if (calculatedDistance > recordDistance) {
    //     winCount++;
    //   }
    // }

    // output *= winCount;
  }
  let realTotalTimeNum = Number(realTotalTime);
  let realTotalDistanceNum = Number(realTotalDistance);

  console.log('realTotalTimeNum', realTotalTimeNum, 'realTotalDistanceNum', realTotalDistanceNum);

  let winCount = 0;
  for (let pressTime = 0; pressTime <= realTotalTimeNum; pressTime++) {
    const calculatedDistance = pressTime * (realTotalTimeNum - pressTime);
    // console.log('pressTime', pressTime, 'calculatedDistance', calculatedDistance);

    if (calculatedDistance > realTotalDistanceNum) {
      winCount++;
    }
  }

  console.log('winCount', winCount);
}
