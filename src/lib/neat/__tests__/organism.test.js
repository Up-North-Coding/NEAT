import { v4 as uuid } from "uuid";
import { NodeTypes } from "../../neural-net/neuron.js";
import Network from "../../neural-net/network.js";
import NodeGene from "../gene-node.js";
import ConnectionGene from "../gene-connection.js";
import Genome from "../genome.js";
import Organism from "../organism.js";
import DefaultConfig from "../default-config.js";

const setup_test_organism = () => {
  const organism = new Organism();
  const genome = new Genome();
  const input1 = new NodeGene(1, NodeTypes.Input);
  const input2 = new NodeGene(2, NodeTypes.Input);
  const input3 = new NodeGene(3, NodeTypes.Input);
  const output1 = new NodeGene(4, NodeTypes.Output);
  const connection1 = new ConnectionGene(input1, output1);
  const connection2 = new ConnectionGene(input2, output1);

  genome.addNode(input1);
  genome.addNode(input2);
  genome.addNode(input3);
  genome.addNode(output1);
  genome.addConnection(DefaultConfig, connection1);
  genome.addConnection(DefaultConfig, connection2);

  organism.genome = genome;

  return {
    organism,
    nodes: [input1, input2, input3, output1],
    connections: [connection1, connection2]
  };
};

describe("The organism class", () => {
  test("should generate set default values for generation and fitness", () => {
    const { organism } = setup_test_organism();
    expect(organism.fitness).toBe(0);
    expect(organism.generation).toBe(0);
  });

  test("should set originalFitness on a copy", () => {
    const { organism } = setup_test_organism();
    organism.originalFitness = 5;
    const new_organism = organism.copy();
    expect(new_organism.originalFitness).toBe(5);
  });

  test("should generate a neural network when calling getNetwork and none exists", () => {
    const { organism } = setup_test_organism();
    expect(organism.network).toBeNull();
    organism.getNetwork();
    expect(organism.network).not.toBeNull();
  });

  test("should not generate a neural network when calling getNetwork and one exists", () => {
    const { organism } = setup_test_organism();
    expect(organism.network).toBeNull();
    organism.network = new Network();
    expect(organism.network).not.toBeNull();
    const _network = organism.network;
    organism.getNetwork();
    expect(organism.network).toBe(_network);
  });
});
