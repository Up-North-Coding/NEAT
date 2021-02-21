import { v4 as uuid } from "uuid";
import { NodeTypes } from "../../neural-net/neuron.js";
import NodeGene from "../gene-node.js";
import ConnectionGene from "../gene-connection.js";
import Genome from "../genome.js";
import DefaultConfig from "../default-config.js";

const setup_test_genome = () => {
  const genome = new Genome();

  const input1 = new NodeGene(1, NodeTypes.Input);
  const input2 = new NodeGene(2, NodeTypes.Input);
  const input3 = new NodeGene(3, NodeTypes.Input);
  const output1 = new NodeGene(4, NodeTypes.Output);
  const connection1 = new ConnectionGene(input1, output1);
  const connection2 = new ConnectionGene(input2, output1);

  genome.addNode(input1);
  // Should do nothing, but it tests a branch
  genome.addNode(input1);
  // And continue with our lives
  genome.addNode(input2);
  genome.addNode(input3);
  genome.addNode(output1);
  genome.addConnection(DefaultConfig, connection1);
  genome.addConnection(DefaultConfig, connection2);

  return {
    genome,
    nodes: [input1, input2, input3, output1],
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
    expect(genome.connectionExists(nodes[0], nodes[3])).toBe(true);
    expect(genome.connectionExists(nodes[0], nodes[1])).toBe(false);
  });

  test("mutateAddConnection should add a random connection to the network", () => {
    const { genome, nodes, connections } = setup_test_genome();
    const config = { ...DefaultConfig };
    config.addConnectionTries = 1000;
    genome.mutateAddConnection(config);
    const new_connections = genome.getConnections();
    expect(new_connections.length).toBeGreaterThan(connections.length);
  });

  test("mutateAddNode should add a random node to the network", () => {
    const { genome, nodes, connections } = setup_test_genome();
    const config = { ...DefaultConfig };
    genome.mutateAddNode(config);
    const new_connections = genome.getConnections();
    expect(new_connections.length).toBeGreaterThan(connections.length);
  });

  test("reEnableGene should reenable the first disabled connection gene", () => {
    const { genome, nodes, connections } = setup_test_genome();
    genome.getConnections()[1].disable();
    expect(genome.getConnections().length).toBe(1);
    genome.reEnableGene();
    expect(genome.getConnections().length).toBe(2);
  });

  test("mutateToggleEnable shoud toggle connection enabled on a random connection", () => {
    const { genome, nodes, connections } = setup_test_genome();
    expect(genome.getConnections().length).toBe(2);
    genome.mutateToggleEnable();
    // Test to make sure that one connection disabled
    expect(genome.getConnections().length).toBe(1);

    // Disable all connections
    genome.getConnections().forEach((connection) => {
      connection.disable();
    });

    expect(genome.getConnections().length).toBe(0);
    genome.mutateToggleEnable();

    // Test to make sure that one connection enabled
    expect(genome.getConnections().length).toBe(1);
  });

  test("mutateConnectionsWeights should change connection weights on all connections", () => {
    const { genome, nodes, connections } = setup_test_genome();
    const weights = genome.getConnections().map((c) => c.weight);
    genome.mutateConnectionsWeights(DefaultConfig);
    const new_weights = genome.getConnections().map((c) => c.weight);
    expect(new_weights.some((weight, index) => weight !== weights[index])).toBe(
      true
    );

    for (let i = 0; i < 100; i++) {
      // Mutate the connections weights a lot to ensure code coverage of the branch
      genome.mutateConnectionsWeights(DefaultConfig);
    }
  });
});
