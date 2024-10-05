import { readLines, spiltWithSpace } from '../utils.mjs';
import util from 'util';

const mapSrcToDest = (num, dest, source, length) => {
  //   console.log('num', num, 'dest', dest, 'source', source, 'length', length);
  if (num >= source && num <= source + length) {
    // console.log('mapped to', num + dest - source);
    return num + dest - source;
  } else {
    return num;
  }
};

const mapSrcToDestAll = (num, map) => {
  for (const { dest, source, length } of map) {
    const mappedNum = mapSrcToDest(num, dest, source, length);
    if (mappedNum != num) return mappedNum;
  }
  return num;
};

export async function day5() {
  const inputData = {
    seeds: { title: 'seeds:', seedNums: [] },
    seedToSoil: { title: 'seed-to-soil map:', map: [] },
    soilToFertilizer: { title: 'soil-to-fertilizer map:', map: [] },
    fertilizerToWater: { title: 'fertilizer-to-water map:', map: [] },
    waterToLight: { title: 'water-to-light map:', map: [] },
    lightToTemperature: { title: 'light-to-temperature map:', map: [] },
    temperatureToHumidity: {
      title: 'temperature-to-humidity map:',
      map: [],
    },
    humidityToLocation: { title: 'humidity-to-location map:', map: [] },
  };

  let currentParseInput = {};

  for await (const line of readLines('./day5/input.txt')) {
    if (line.startsWith('seeds:')) {
      const token = line.split(':');
      const seedListToken = token[1];
      inputData.seeds.seedNums = spiltWithSpace(seedListToken).map((item) => Number(item));
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

      currentParseInput.map.push({ dest, source, length });
    }
  }

  let lowestLocation = Infinity;

  for (const seed of inputData.seeds.seedNums) {
    console.log('seed->soil->fertilizer->water->light->temperature->humidity->location');
    let soil = mapSrcToDestAll(seed, inputData.seedToSoil.map);
    if (!soil) soil = seed;

    let fertilizer = mapSrcToDestAll(soil, inputData.soilToFertilizer.map);
    if (!fertilizer) fertilizer = soil;

    let water = mapSrcToDestAll(fertilizer, inputData.fertilizerToWater.map);
    if (!water) water = fertilizer;

    let light = mapSrcToDestAll(water, inputData.waterToLight.map);
    if (!light) light = water;

    let temperature = mapSrcToDestAll(light, inputData.lightToTemperature.map);
    if (!temperature) temperature = light;

    let humidity = mapSrcToDestAll(temperature, inputData.temperatureToHumidity.map);
    if (!humidity) humidity = temperature;

    let location = mapSrcToDestAll(humidity, inputData.humidityToLocation.map);
    if (!location) location = humidity;

    console.log(
      seed,
      '->',
      soil,
      '->',
      fertilizer,
      '->',
      water,
      '->',
      light,
      '->',
      temperature,
      '->',
      humidity,
      '->',
      location
    );

    if (location < lowestLocation) {
      lowestLocation = location;
    }
  }

  console.log('lowestLocation', lowestLocation);
}
