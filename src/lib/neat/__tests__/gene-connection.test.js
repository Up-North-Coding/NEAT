import ConnectionGene from "../gene-connection.js";
import NodeGene from "../gene-node.js";

describe("The gene connection class", () => {
  test("should throw an error if the first argument is not a NodeGene", () => {
    expect(() => {
      const connection_gene = new ConnectionGene();
    }).toThrow();
  });

  test("should throw an error if the second argument is not a NodeGene", () => {
    expect(() => {
      const from = new NodeGene();
      const connection_gene = new ConnectionGene(from);
    }).toThrow();
  });

  test("should update the weight, enabled, and innovation status with the third, fourth, and fifth constructor args", () => {
    const from = new NodeGene();
    const to = new NodeGene();
    const connection_gene = new ConnectionGene(from, to, 1, false, 0.5);

    expect(connection_gene.weight).toBe(1);
    expect(connection_gene.enabled).toBe(false);
    expect(connection_gene.innovation).toBe(0.5);
  });

  test("should return a copy of the object with equal parameters", () => {
    const from = new NodeGene();
    const to = new NodeGene();
    const connection_gene = new ConnectionGene(from, to, 1, false, 0.5);
    const copy = connection_gene.copy();

    expect(copy instanceof ConnectionGene).toBe(true);
    expect(connection_gene === copy).toBe(false);
    expect(connection_gene.from === copy.from).toBe(true);
    expect(connection_gene.to === copy.to).toBe(true);
    expect(connection_gene.weight === copy.weight).toBe(true);
    expect(connection_gene.enabled === copy.enabled).toBe(true);
    expect(connection_gene.innovation === copy.innovation).toBe(true);
  });
});
