import NodeGene from "./gene-node.js";

class ConnectionGene {
  from = null;
  to = null;
  weight = 1;
  enabled = true;
  innovation = 0;

  constructor(from, to, weight = 1, enabled = true, innovation = 0) {
    if (!(from instanceof NodeGene)) {
      throw new Error(
        "Connection constructor requires a NodeGene as the first argument"
      );
    }

    if (!(to instanceof NodeGene)) {
      throw new Error(
        "Connection constructor requires a NodeGene as the second argument"
      );
    }

    this.from = from;
    this.to = to;
    this.weight = weight;
    this.enabled = enabled;
    this.innovation = innovation;
  }

  disable() {
    this.enabled = false;
  }

  copy() {
    return new ConnectionGene(
      this.from,
      this.to,
      this.weight,
      this.enabled,
      this.innovation
    );
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

      if (connection.to.id === startNode.id) return true;

      stack.push(
        ...connections.filter((gene) => gene.from.id === connection.to.id)
      );
    }

    return false;
  }
}

export default ConnectionGene;
