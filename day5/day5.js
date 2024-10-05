import { readLines, spiltWithSpace } from '../utils.mjs';
import util from 'util';

const mapSrcToDest = (numRangeInput, srcToDestMaps) => {
  console.log('mapSrcToDest numRangeInput', numRangeInput);

  let toProcessNumRange = numRangeInput;
  const mappedRanges = [];

  let count = 0;

  while (true) {
    const [num, numRange] = toProcessNumRange;
    console.log('toProcessNumRange', toProcessNumRange);

    let lowestPositiveDiff = Infinity;
    let mapForSplit = undefined;

    for (const srcToDestMap of srcToDestMaps) {
      const sourceDiff = srcToDestMap.source - num;
      console.log('cal sourceDiff', sourceDiff);
      if (sourceDiff >= 0 && sourceDiff < lowestPositiveDiff) {
        lowestPositiveDiff = sourceDiff;
        mapForSplit = srcToDestMap;
      }
    }
    console.log('mapForSplit', mapForSplit, 'lowestPositiveDiff', lowestPositiveDiff);

    if (mapForSplit) {
      // case 1: no map
      if (lowestPositiveDiff > 0) {
        const noMapNumRange = [num, lowestPositiveDiff];
        mappedRanges.push(noMapNumRange);
        console.log('noMapNumRange', noMapNumRange);
      }

      // case 2: map
      const remainNumInRange = numRange - lowestPositiveDiff;
      console.log('remainNumInRange', remainNumInRange);

      const totalNumToMap =
        mapForSplit.length > remainNumInRange ? remainNumInRange : mapForSplit.length;

      const mapDiff = mapForSplit.dest - mapForSplit.source;
      const mapNumRange = [mapForSplit.source + mapDiff, totalNumToMap];
      mappedRanges.push(mapNumRange);
      console.log('mapNumRange', mapNumRange);

      // case 3: to process
      toProcessNumRange = [
        mapForSplit.source + totalNumToMap,
        numRange - lowestPositiveDiff - totalNumToMap,
      ];
      console.log('new toProcessNumRange', toProcessNumRange);
    } else {
      if (numRange > 0) {
        mappedRanges.push(toProcessNumRange);
        console.log('last range', toProcessNumRange);
      }
      break;
    }
    console.log('-------------', count);

    count++;
    if (count === 2) break;
  }

  console.log('mappedRanges', mappedRanges);

  return mappedRanges;
};

export async function day5() {
  const inputData = {
    seeds: { title: 'seeds:', seedRanges: [] },
    seedToSoil: { title: 'seed-to-soil map:', maps: [] },
    soilToFertilizer: { title: 'soil-to-fertilizer map:', maps: [] },
    fertilizerToWater: { title: 'fertilizer-to-water map:', maps: [] },
    waterToLight: { title: 'water-to-light map:', maps: [] },
    lightToTemperature: { title: 'light-to-temperature map:', maps: [] },
    temperatureToHumidity: {
      title: 'temperature-to-humidity map:',
      maps: [],
    },
    humidityToLocation: { title: 'humidity-to-location map:', maps: [] },
  };

  let currentParseInput = {};

  for await (const line of readLines('./day5/input.txt')) {
    if (line.startsWith('seeds:')) {
      const token = line.split(':');
      const seedListToken = token[1];
      const seedRangeTokens = spiltWithSpace(seedListToken).map((item) => Number(item));

      let seedNum = -1;
      for (let i = 0; i < seedRangeTokens.length; i++) {
        const seedRangeToken = seedRangeTokens[i];
        if (i % 2 === 0) {
          seedNum = seedRangeToken;
        } else {
          const range = seedRangeToken;
          inputData.seeds.seedRanges.push({ seedNum, range });
        }
      }

      //   inputData.seeds.seedNums = spiltWithSpace(seedListToken).map((item) => Number(item));
    } else if (line.trim() === '') {
      // do noting if line is empty.
    } else if (line.includes(':')) {
      for (const [key, val] of Object.entries(inputData)) {
        if (val.title === line.trim()) {
          currentParseInput = val;
        }
      }
    } else {
      const token = spiltWithSpace(line);
      const dest = Number(token[0]);
      const source = Number(token[1]);
      const length = Number(token[2]);

      currentParseInput.maps.push({ dest, source, length });
    }
  }

  //   console.log('seedRanges', inputData.seeds.seedRanges);
  console.log(
    'inputData',
    util.inspect(inputData, { showHidden: false, depth: null, colors: true })
  );

  let lowestLocation = Infinity;

  for (const { seedNum, range } of inputData.seeds.seedRanges) {
    // seed to soil map
    mapSrcToDest([seedNum, range], inputData.seedToSoil.maps);
  }

  console.log('lowestLocation', lowestLocation);
}
