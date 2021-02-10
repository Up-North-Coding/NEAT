import NodeGene from "../gene-node.js";

describe("The node gene class", () => {
  test("should set the ID in the constructor", () => {
    const node_gene = new NodeGene(1);

    expect(node_gene).toHaveProperty("id", 1);
  });

  test("should set a UUID as the ID if none is passed in the constructor", () => {
    const node_gene = new NodeGene();

    expect(node_gene.id.length).toBeGreaterThan(0);
  });

  test("should return a copy of the object with equal parameters", () => {
    const node_gene = new NodeGene();
    const copy = node_gene.copy();

    expect(copy instanceof NodeGene).toBe(true);
    expect(node_gene === copy).toBe(false);
    expect(node_gene.id === copy.id).toBe(true);
    expect(node_gene.type === copy.type).toBe(true);
  });
});
