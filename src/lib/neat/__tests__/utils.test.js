import DefaultConfig from "../default-config.js";
import { gaussian, descending, wrapNumber } from "../utils.js";

describe("Utils", () => {
  test("Gaussian function should be implemented correctly", () => {
    const rand = gaussian();
    expect(rand.next().value).toEqual(expect.any(Number));
    expect(rand.next().value).toEqual(expect.any(Number));
  });

  test("Descending sorts gud", () => {
    const test_case = [1, 2, 3];
    const sorted = test_case.sort(descending());
    expect(sorted[0]).toEqual(3);
  });

  test("Wrap number does it's thang", () => {
    expect(wrapNumber(5, 10, 13)).toEqual(7);
  });
});
