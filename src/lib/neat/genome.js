import { v4 as uuid } from "uuid";
import ConnectionGene from "./gene-connection.js";
import NodeGene from "./gene-node.js";
import { NodeTypes } from "../neural-net/neuron.js";
import {
  rand,
  getRandomItems,
  mean,
  ascending,
  descending,
  randomBool
} from "./utils.js";

class Genome {
  connections = new Map();
  nodes = new Map();
  id = "";

  constructor(id = uuid()) {
    this.id = id;
  }

  copy() {
    const genome = new Genome(this.id);

    for (let [key, gene] of this.connections) {
      genome.connections.set(key, gene.copy());
    }

    for (let [key, gene] of this.nodes) {
      genome.nodes.set(key, gene.copy());
    }

    return genome;
  }

  /**
   * Returns a list of enabled connections
   */
  getConnections() {
    return Array.from(this.connections.values()).filter((gene) => gene.enabled);
  }

  /**
   * Checks whether a connection between two nodes exists
   * @param node1
   * @param node2
   */
  connectionExists(node1, node2) {
    return Array.from(this.connections.values()).some(
      (connection) =>
        connection.from.id === node1.id && connection.to.id === node2.id
    );
  }

  addConnection(config, connection) {
    connection.innovation = config.innovation.next().value;
    this.connections.set(connection.innovation, connection);
  }

  addNode(node) {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, node);
    }
  }

  /**
   * Adds a connection mutation
   */
  mutateAddConnection(config) {
    const nodes = Array.from(this.nodes.values());
    const connections = Array.from(this.connections.values());

    const non_output_nodes = nodes.filter((node) => !NodeGene.isOutput(node));
    const non_sensor_nodes = nodes.filter((node) => !NodeGene.isSensor(node));

    for (let i = config.addConnectionTries; i > 0; i--) {
      const [from] = getRandomItems(non_output_nodes, 1);

      const [to] = getRandomItems(
        non_sensor_nodes.filter(
          (node) =>
            // exclude self loops
            node !== from &&
            // consider connections between output nodes recurrent
            (from.type === NodeTypes.Output
              ? node.type !== NodeTypes.Output
              : true)
        ),
        1
      );

      const connection = new ConnectionGene(
        from,
        to,
        rand(config.mutationPower, -config.mutationPower)
      );

      const isValid =
        // connection already exists
        !this.connectionExists(from, to) &&
        // is a RNN
        !(
          config.feedForwardOnly && Genome.isRecurrent(connection, connections)
        );

      if (isValid) {
        this.addConnection(config, connection);
        return;
      }
    }
  }

  mutateAddNode(config) {
    if (!this.connections.size) return;

    const [connection] = getRandomItems(this.getConnections(), 1);

    const new_node = new NodeGene();
    new_node.type = NodeTypes.Other;

    // Disable the old connection in favor of a split connection with a node in the middle
    connection.disable();

    this.addConnection(config, new ConnectionGene(connection.from, new_node));
    this.addConnection(
      config,
      new ConnectionGene(new_node, connection.to, connection.weight)
    );

    this.addNode(new_node);
  }

  /**
   * Enable first disabled gene
   */
  reEnableGene() {
    for (const connection of this.connections.values()) {
      if (!connection.enabled) {
        connection.enabled = true;
        return;
      }
    }
  }

  /**
   * Mutate a connection by enabling/disabling
   * @param times
   */
  mutateToggleEnable(times = 1) {
    const connections = Array.from(this.connections.values());

    for (; times > 0; times--) {
      const [connection] = getRandomItems(connections, 1);

      if (connection.enabled) {
        // A connection is "safe" to disable if:
        //   - any other connection:
        //     - has a different "from" node
        //     - OR is disabled
        //     - OR is the same connection
        const isSafe = connections.some(
          (c) =>
            c.from !== connection.from ||
            !c.enabled ||
            c.innovation === connection.innovation
        );

        connection.enabled = !isSafe;
      } else {
        connection.enabled = true;
      }
    }
  }

  /**
   * Mutate all connections
   */
  mutateConnectionsWeights({ mutationPower, genomeWeightPerturbated }) {
    for (let [key, connection] of this.connections) {
      const random = rand(mutationPower, -mutationPower);
      if (connection.enabled) {
        if (rand() < genomeWeightPerturbated) {
          connection.weight += random;
        } else {
          connection.weight = random;
        }
      }
    }
  }

  /**
   * Compute the compatibility distance between two genomes
   * @param genome1
   * @param genome2
   * @param config
   */
  static compatibility(genome1, genome2, config) {
    let innovationNumbers = new Set([
      ...genome1.connections.keys(),
      ...genome2.connections.keys()
    ]);

    let excess = Math.abs(genome1.connections.size - genome2.connections.size),
      disjoint = -excess,
      matching = [],
      N = Math.max(genome1.connections.size, genome2.connections.size, 1);

    innovationNumbers.forEach((innovation) => {
      const gene1 = genome1.connections.get(innovation),
        gene2 = genome2.connections.get(innovation);

      if (gene1 && gene2) {
        matching.push(Math.abs(gene1.weight - gene2.weight));
      } else if (!gene1 || !gene2) {
        disjoint++;
      }
    });

    return (
      (excess * config.excessCoefficient +
        disjoint * config.disjointCoefficient) /
        N +
      mean(...matching) * config.weightDifferenceCoefficient
    );
  }

  /**
   * Mate 2 organisms
   * @param genome1
   * @param genome2
   */
  static crossover(genome1, genome2, config) {
    const child = new Genome();

    // [moreFit, lessFit]
    const [hFitParent, lFitParent] = [genome1, genome2].sort(
      descending((i) => i.fitness)
    );

    let innovationNumbers = new Set([
      ...hFitParent.connections.keys(),
      ...lFitParent.connections.keys()
    ]);

    // Ensure that all sensors and ouputs are added to the organism
    hFitParent.nodes.forEach((node) => {
      if (NodeGene.isSensor(node) || NodeGene.isOutput(node)) {
        child.addNode(node.copy());
      }
    });

    Array.from(innovationNumbers.values())
      .sort(ascending())
      .forEach((innovationNumber) => {
        const hConnection = hFitParent.connections.get(innovationNumber),
          lConnection = lFitParent.connections.get(innovationNumber);

        let connection = hConnection || lConnection;
        if (hConnection && lConnection) {
          connection = randomBool() ? hConnection : lConnection;
        }

        if (
          config.feedForwardOnly &&
          Genome.isRecurrent(connection, child.getConnections())
        ) {
          return null;
        }

        child.connections.set(innovationNumber, connection);

        connection.from = connection.from.copy();
        connection.to = connection.to.copy();

        child.addNode(connection.from);
        child.addNode(connection.to);
      });

    return child;
  }

  /**
   * Perform genome's mutations
   * @param genome
   * @param config
   */
  static mutateGenome(genome, config) {
    if (rand() < config.mutateAddNodeProbability) {
      genome.mutateAddNode(config);
    } else if (rand() < config.mutateAddConnectionProbability) {
      genome.mutateAddConnection(config);
    } else {
      if (rand() < config.mutateConnectionWeightsProbability) {
        genome.mutateConnectionsWeights(config);
      }
      if (rand() < config.mutateToggleEnableProbability) {
        genome.mutateToggleEnable();
      }
      if (rand() < config.reEnableGeneProbability) {
        genome.reEnableGene();
      }
    }

    return genome;
  }

  /**
   * Check whether the connection creates a loop inside the network
   * @param connection
   * @param connections
   */
  static isRecurrent(connection, connections) {
    const startNode = connection.from;
    const stack = [connection];

    while (stack.length) {
      connection = stack.shift();

      if (connection.to.id === startNode.id) {
        return true;
      }

      stack.push(
        ...connections.filter((gene) => gene.from.id === connection.to.id)
      );
    }

    return false;
  }
}

export default Genome;
