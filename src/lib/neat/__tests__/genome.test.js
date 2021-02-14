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

  /*test("should throw an error if the second argument if not an array", () => {
    const neurons = [new Neuron(1), { id: 2 }, new Neuron(3)];

    expect(() => {
      new Network(neurons, "also not an array");
    }).toThrow();
  });

  test("should throw an error if the third argument if not an array", () => {
    const input_neurons = [new Neuron(1), { id: 2 }, new Neuron(3)];
    const output_neurons = [new Neuron(4), { id: 5 }, new Neuron(6)];

    expect(() => {
      new Network(input_neurons, output_neurons, "still not an array");
    }).toThrow();
  });

  test("should throw an error if the first argument has any non-Neurons or {} without an ID", () => {
    const neurons = [new Neuron(1), {}, new Neuron(3)];

    expect(() => {
      new Network(neurons);
    }).toThrow();
  });

  test("should throw an error if the second argument has any non-Neurons or {} without an ID", () => {
    const input_neurons = [new Neuron(1), { id: 2 }, new Neuron(3)];
    const output_neurons = [new Neuron(1), {}, new Neuron(3)];

    expect(() => {
      new Network(input_neurons, output_neurons);
    }).toThrow();
  });

  test("should throw an error if the third argument has any non-Connections or {} without a `from` and a `to`", () => {
    const input_neurons = [new Neuron(1), { id: 2 }, new Neuron(3)];
    const output_neurons = [new Neuron(4), { id: 5 }, new Neuron(6)];
    const connections = [
      new Connection(input_neurons[0], output_neurons[2]),
      { from: 2, to: 5 },
      {}
    ];

    expect(() => {
      new Network(input_neurons, output_neurons, connections);
    }).toThrow();
  });

  test("should throw an error if any neurons have a duplicate ID", () => {
    const input_neurons = [new Neuron(1), { id: 2 }, new Neuron(3)];
    const output_neurons = [new Neuron(3), { id: 4 }, new Neuron(5)];

    expect(() => {
      new Network(input_neurons, output_neurons);
    }).toThrow();
  });

  test("should ingest a mixture of Neurons and { id } into the inputs and outputs", () => {
    const input_neurons = [new Neuron(1), { id: 2 }, new Neuron(3)];
    const output_neurons = [new Neuron(4), { id: 5 }, new Neuron(6)];

    const network = new Network(input_neurons, output_neurons);
    expect(network.inputs.length).toBe(3);
    expect(network.outputs.length).toBe(3);
  });

  test("should throw an error if any of the `from` or `to` on a connection do not exists", () => {
    const input_neurons = [new Neuron(1), { id: 2 }, new Neuron(3)];
    const output_neurons = [new Neuron(4), { id: 5 }, new Neuron(6)];
    const connections = [
      new Connection(input_neurons[0], output_neurons[2]),
      { from: 2, to: 5 },
      { from: 2, to: 7 }
    ];

    expect(() => {
      new Network(input_neurons, output_neurons, connections);
    }).toThrow();
  });

  test("should serialize a network correctly", () => {
    const input_neurons = [new Neuron(1), new Neuron(2)];
    const output_neurons = [new Neuron(3), new Neuron(4)];
    const connections = [
      new Connection(input_neurons[0], output_neurons[0]),
      new Connection(input_neurons[1], output_neurons[1])
    ];

    const network = new Network(input_neurons, output_neurons, connections);

    expect(network.serialize()).toMatchObject({
      neurons: [
        { id: 1, bias: 0, type: NodeTypes.Input },
        { id: 2, bias: 0, type: NodeTypes.Input },
        { id: 3, bias: 0, type: NodeTypes.Output },
        { id: 4, bias: 0, type: NodeTypes.Output }
      ],
      connections: [
        { from: 1, to: 3, weight: 1, enabled: true },
        { from: 2, to: 4, weight: 1, enabled: true }
      ]
    });
  });

  test("should activate and do maths", () => {
    const input_neurons = [new Neuron(1), new Neuron(2)];
    const output_neurons = [new Neuron(3), new Neuron(4)];
    const connections = [
      new Connection(input_neurons[0], output_neurons[0]),
      new Connection(input_neurons[1], output_neurons[1])
    ];

    const network = new Network(input_neurons, output_neurons, connections);

    const inputs = [0.5, 0.5];
    const outputs = network.activate(inputs);

    // Weighted sum of inputs is going to be 0, because weight is not currently set
    const expected_outputs = [0.62245, 0.62245];
    expect(outputs[0]).toBeCloseTo(expected_outputs[0], 4);
    expect(outputs[1]).toBeCloseTo(expected_outputs[1], 4);
  });*/
});
