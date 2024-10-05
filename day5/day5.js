import { readLines, spiltWithSpace } from '../utils.mjs';
import util from 'util';

const mapSrcToDest = (numRangeInput, srcToDestMaps) => {
  console.log('mapSrcToDest numRangeInput', numRangeInput);

  let toProcessNumRange = numRangeInput;

  const [num, numRange] = toProcessNumRange;
  const minNum = num;
  const maxNum = num + numRange;

  let noMapCount = 0;

  const partialMappingData = [];

  for (const { dest, source, length } of srcToDestMaps) {
    const minNumMap = source;
    const maxNumMap = source + length;
    const mapDiff = dest - source;
    // case 1 complete map
    if (minNum >= minNumMap && maxNum <= maxNumMap) {
      return [[num + mapDiff, numRange]];
    }
    // no map
    else if (
      (minNum < minNumMap && maxNum < minNumMap) ||
      (minNum > maxNumMap && maxNum > maxNumMap)
    ) {
      noMapCount++;
    }
    // partial map
    else {
      //   const noMapLeftLower = num;
      //   const noMapLeftUpper = source - 1;
      const mapLower = source;
      const mapUpper = source + length - 1;
      //   const noMapRightLower = source + length;
      //   const noMapRightUpper = num + numRange;

      partialMappingData.push({
        mapLower,
        mapUpper,
        mapDiff,
      });
    }
  }

  // case 2 no map all
  if (noMapCount === srcToDestMaps.length) {
    return [[num, numRange]];
  }

  // case 3 partial map
  const mappedRanges = [];

  partialMappingData.sort(function (a, b) {
    return a['mapLower'] - b['mapLower'];
  });
  console.log('partialMappingData', partialMappingData);

  let numRangeToProcess = [num, numRange];

  let hasRightRange = true;

  for (const { mapLower, mapUpper, mapDiff } of partialMappingData) {
    const min = numRangeToProcess[0];
    const max = numRangeToProcess[0] + numRangeToProcess[1] - 1;
    const mapRangeMin = mapLower < min ? min : mapLower;
    const mapRangeMax = mapUpper > max ? max : mapUpper;
    const leftRangeMin = min;
    const leftRangeMax = mapRangeMin - 1;
    const rightRangeMin = mapRangeMax + 1;
    const rightRangeMax = max;

    // num before mapped num
    if (leftRangeMin <= leftRangeMax) {
      mappedRanges.push([leftRangeMin, leftRangeMax - leftRangeMin + 1]);
    }

    // insert mapped num
    mappedRanges.push([mapRangeMin + mapDiff, mapRangeMax - mapRangeMin + 1]);

    // num after mapped num
    if (rightRangeMin <= rightRangeMax) {
      numRangeToProcess = [rightRangeMin, rightRangeMax - rightRangeMin + 1];
    } else {
      hasRightRange = false;
      console.log(
        'cant find right range!',
        'rightRangeMin',
        rightRangeMin,
        'rightRangeMax',
        rightRangeMax,
        'mapUpper',
        mapUpper,
        'mapLower',
        mapLower,
        'numRangeToProcess',
        numRangeToProcess
      );
      break;
    }
  }

  if (hasRightRange) mappedRanges.push(numRangeToProcess);

  console.log('mappedRanges', mappedRanges);

  return mappedRanges;
};

const mapSrcToDestAll = (allNumRangeInput, srcToDestMaps) => {
  const allMappedResult = [];
  for (const numRangeInput of allNumRangeInput) {
    allMappedResult.push(...mapSrcToDest(numRangeInput, srcToDestMaps));
  }
  return allMappedResult;
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
    const soil = mapSrcToDestAll([[seedNum, range]], inputData.seedToSoil.maps);
    console.log('soil', soil);

    // soil to fertilizer map
    const fertilizer = mapSrcToDestAll(soil, inputData.soilToFertilizer.maps);
    console.log('fertilizer', fertilizer);

    // fertilizer-to-water map
    const water = mapSrcToDestAll(fertilizer, inputData.fertilizerToWater.maps);
    console.log('water', water);

    // water-to-light map
    const light = mapSrcToDestAll(water, inputData.waterToLight.maps);
    console.log('light', light);

    // light-to-temperature map
    const temperature = mapSrcToDestAll(light, inputData.lightToTemperature.maps);
    console.log('temperature', temperature);

    // temperature-to-humidity map
    const humidity = mapSrcToDestAll(temperature, inputData.temperatureToHumidity.maps);
    console.log('humidity', humidity);

    // humidity-to-location map
    const location = mapSrcToDestAll(humidity, inputData.humidityToLocation.maps);
    console.log('location', location);

    // find lowest location
    for (const eachLocation of location) {
      if (eachLocation[0] < lowestLocation) {
        lowestLocation = eachLocation[0];
      }
    }
  }

  console.log('lowestLocation', lowestLocation);
}
