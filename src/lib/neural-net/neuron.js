export const NodeTypes = {
  Input: 1,
  Output: 2,
  Bias: 3,
  Other: 4
};

class Neuron {
  id = "";
  value = 0;
  bias = 0;
  type = null;
  inbound_connections = [];
  outbound_connections = [];

  constructor(id, type = NodeTypes.Other) {
    if (id === undefined) {
      throw new Error(
        "Neuron constructor requires an ID as the first argument"
      );
    }

    this.id = id;
    this.type = type;
  }
}

export default Neuron;
