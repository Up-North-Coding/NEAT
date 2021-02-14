import { v4 as uuid } from "uuid";
import ConnectionGene from "./gene-connection.js";
import NodeGene from "./gene-node.js";
import {
  getRandomItems,
  rnd,
  isSensor,
  isOutput,
  isRecurrent
} from "./utils.js";
import { NodeTypes } from "../neural-net/neuron.js";

export class Genome {
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
    // TODO: Gain performance via short circuit evaluation intead of creating a whole array from values?
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

    for (let maxTries = config.addConnectionTries; i > 0; i--) {
      const [from] = getRandomItems(
        nodes.filter((node) => !isOutput(node)),
        1
      );

      const [to] = getRandomItems(
        nodes.filter(
          (node) =>
            // don't allow sensors to get input
            !isSensor(node) &&
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
        rnd(config.mutationPower, -config.mutationPower)
      );

      const isValid =
        // connection already exists
        !this.connectionExists(form, to) &&
        // is a RNN
        (!config.feedForwardOnly || !isRecurrent(connection, connections));

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
  mutateToggleEnable(times) {
    const connections = Array.from(this.connections.values());

    for (; times > 0; times--) {
      const [connection] = getRandomItems(connections, 1);

      if (connection.enabled) {
        // TODO: figure out what the purpose of this is
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
      const random = rnd(mutationPower, -mutationPower);
      if (connection.enabled) {
        if (rnd() < genomeWeightPerturbated) {
          connection.weight += random;
        } else {
          connection.weight = random;
        }
      }
    }
  }
}

export default Genome;
