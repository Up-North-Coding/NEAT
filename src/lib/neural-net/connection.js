import Neuron from "./neuron.js";

class Connection {
  weight = 0;
  from = null;
  to = null;
  enabled = true;

  constructor(from, to, weight = 0, enabled = true) {
    if (!(from instanceof Neuron)) {
      throw new Error(
        "Connection constructor requires a Neuron as the first argument"
      );
    }

    if (!(to instanceof Neuron)) {
      throw new Error(
        "Connection constructor requires a Neuron as the second argument"
      );
    }

    this.from = from;
    this.to = to;
    this.weight = weight;
    this.enabled = enabled;
  }
}

export default Connection;
