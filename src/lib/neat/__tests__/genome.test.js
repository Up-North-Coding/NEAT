import { v4 as uuid } from "uuid";
import NodeGene from "../gene-node.js";
import ConnectionGene from "../gene-connection.js";
import Genome from "../genome.js";
import DefaultConfig from "../default-config.js";

const setup_test_genome = () => {
  const genome = new Genome();

  const node1 = new NodeGene();
  const node2 = new NodeGene();
  const node3 = new NodeGene();
  const connection1 = new ConnectionGene(node1, node3);
  const connection2 = new ConnectionGene(node2, node3);

  genome.addNode(node1);
  genome.addNode(node2);
  genome.addNode(node3);
  genome.addConnection(DefaultConfig, connection1);
  genome.addConnection(DefaultConfig, connection2);

  return {
    genome,
    nodes: [node1, node2, node3],
    connections: [connection1, connection2]
  };
};

describe("The genome class", () => {
  test("should generate a UUID if the first argument is not an ID", () => {
    const genome = new Genome();
    expect(genome.id.length).toBeGreaterThan(0);
  });

  test("should return a copy of the object with equal parameters", () => {
    const { genome, nodes, connections } = setup_test_genome();
    const genome_copy = genome.copy();

    expect(genome.id).toBe(genome_copy.id);

    for (let [key, node_gene] of genome.nodes) {
      expect(genome_copy.nodes.get(key)).toBeDefined();
    }

    for (let [key, connection_gene] of genome.connections) {
      expect(genome_copy.connections.get(key)).toBeDefined();
    }
  });

  test("getConnections should return all enabled connections", () => {
    const { genome, nodes, connections } = setup_test_genome();
    connections[0].disable();

    const genome_connections = genome.getConnections();
    expect(genome_connections.length).toBe(1);
  });

  test("connectionExists should return a boolean based on if a connection exists between two nodes", () => {
    const { genome, nodes, connections } = setup_test_genome();
    expect(genome.connectionExists(nodes[0], nodes[2])).toBe(true);
    expect(genome.connectionExists(nodes[0], nodes[1])).toBe(false);
  });
});
