import { NodeTypes } from "../neural-net/neuron.js";

/**
 * Picks n random items from the given list
 * @param list
 * @param n
 */
export function getRandomItems(list, n) {
  let result = [];
  let source = [...list];

  n = Math.min(n, list.length);

  while (result.length < n) {
    let i = Math.floor(rand(source.length));
    result.push(...source.splice(i, 1));
  }

  return result;
}

/**
 * Compute the mean of the given values
 * @param values
 */
export function mean(...values) {
  return values.length
    ? values.reduce((sum, n) => sum + n, 0) / values.length
    : 0;
}

/**
 * Returns a random boolean
 */
export function randomBool() {
  return Math.random() > 0.5;
}

/**
 * Returns a random number between from/to arguments
 * @param to
 * @param from
 */
export function rand(to = 1, from = 0) {
  return Math.random() * (to - from) + from;
}

/**
 * Returns a normally distribuited random number (Box-Muller transform)
 */
export function* gaussian(mean = 0, standardDeviation = 1) {
  let u, v, s;

  while (true) {
    do {
      v = rand(1, -1);
      u = rand(1, -1);
      s = u ** 2 + v ** 2;
    } while (s === 0 || s >= 1);

    s = Math.sqrt((-2 * Math.log(s)) / s);

    yield s * u * standardDeviation + mean;
    yield s * v * standardDeviation + mean;
  }
}

//export function sigmoid(x, slope = 4.924273) {
export function sigmoid(x, slope = 1) {
  return 1 / (1 + Math.exp(-slope * x));
}

/**
 * Sorts an array from largest to smallest
 * @param keyFn
 */
export function descending(keyFn = (i) => i) {
  return (a, b) => keyFn(b) - keyFn(a);
}

/**
 * Sorts an array from smallest to largest
 * @param keyFn
 */
export function ascending(keyFn = (i) => i) {
  return (a, b) => keyFn(a) - keyFn(b);
}

export const byFitness = (i) => i.fitness;
export const byMaxFitness = (i) => i.maxFitness;
export const byInnovation = (i) => i.innovation;
export const byType = (i) => i.type;

/**
 * Keeps the given value between the specified range
 * @param min
 * @param max
 * @param value
 */
export function wrapNumber(min, max, value) {
  const l = max - min + 1;
  return ((((value - min) % l) + l) % l) + min;
}

/**
 * Create a new innovation number generator
 */
export function* Innovation(i = 0) {
  while (true) {
    yield i++;
  }
}
