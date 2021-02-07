import Connection from "../connection.js";
import Neuron from "../neuron.js";

describe("The connection class", () => {
  test("should throw an error if the first argument is not a Neuron", () => {
    expect(() => {
      const connection = new Connection();
    }).toThrow();
  });

  test("should throw an error if the second argument is not a Neuron", () => {
    expect(() => {
      const from = new Neuron(1);
      const connection = new Connection(from);
    }).toThrow();
  });

  test("should update the weight and enabled status with the third and forth constructor args", () => {
    const from = new Neuron(1);
    const to = new Neuron(2);
    const connection = new Connection(from, to, 1, false);

    expect(connection.weight).toBe(1);
    expect(connection.enabled).toBe(false);
  });
});
