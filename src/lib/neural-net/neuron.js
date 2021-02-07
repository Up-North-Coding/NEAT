class Neuron {
  id = "";
  value = 0;
  bias = 0;
  inbound_connections = [];
  outbound_connections = [];

  constructor(id) {
    if (id === undefined) {
      throw new Error(
        "Neuron constructor requires an ID as the first argument"
      );
    }

    this.id = id;
  }
}

export default Neuron;
