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
}

export default ConnectionGene;
