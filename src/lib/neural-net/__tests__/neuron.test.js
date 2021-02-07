import Neuron from "../neuron.js";

describe("The neuron class", () => {
  test("should set the ID in the constructor", () => {
    const neuron = new Neuron(1);

    expect(neuron).toHaveProperty("id", 1);
  });

  test("should error if an ID is not sent in the constructor", () => {
    expect(() => {
      const neuron = new Neuron();
    }).toThrow();
  });
});
