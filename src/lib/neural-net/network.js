import Neuron, { NodeTypes } from "./neuron.js";
import Connection from "./connection.js";
import { sigmoid } from "../neat/utils.js";

export default class Network {
  inputs = [];
  outputs = [];
  neurons = new Map();
  activation = sigmoid;
  state = [{}, {}];
  connections = [];

  constructor(neurons = [], connections = []) {
    if (!Array.isArray(neurons)) {
      throw new Error(
        "Network constructor requires an array as the first argument"
      );
    }

    if (!Array.isArray(connections)) {
      throw new Error(
        "Network constructor requires an array as the second argument"
      );
    }

    const id_to_neuron_cache = {};

    for (let neuron of neurons) {
      if (!(neuron instanceof Neuron) && neuron?.id === undefined) {
        throw new Error(
          "Network constructor requires an array of {} with ID property or Neurons"
        );
      }

      const _neuron =
        neuron instanceof Neuron ? neuron : new Neuron(neuron.id, neuron.type);
      this.addNeuron(_neuron);
    }

    for (let connection of connections) {
      if (
        !(connection instanceof Connection) &&
        (connection?.from === undefined || connection?.to === undefined)
      ) {
        throw new Error(
          "Network constructor requires an array of {} with `from` and `to` properties or Connections"
        );
      }

      this.addConnection(
        connection instanceof Connection
          ? connection
          : new Connection(
              this.neurons.get(connection.from),
              this.neurons.get(connection.to),
              connection.weight,
              connection.enabled
            )
      );
    }
  }

  /**
   * Adds a neuron to the neural network
   * @param neuron
   */
  addNeuron(neuron) {
    if (!(neuron instanceof Neuron)) {
      throw new Error(
        "Network.addNeuron argument must be an instance of Neuron"
      );
    }

    if (this.neurons.has(neuron.id)) {
      throw new Error("Duplicate neuron ID");
    }

    if (neuron.type === NodeTypes.Input) {
      this.inputs.push(neuron);
    } else if (neuron.type === NodeTypes.Output) {
      this.outputs.push(neuron);
    }

    this.neurons.set(neuron.id, neuron);
    this.state[0][neuron.id] = 0;
    this.state[1][neuron.id] = 0;
  }

  /**
   * Adds a connection to the neural network
   * @param connection
   */
  addConnection(connection) {
    const fromNeuron = this.neurons.get(connection.from.id);
    const toNeuron = this.neurons.get(connection.to.id);

    if (fromNeuron === undefined || toNeuron === undefined) {
      throw new Error(
        "The connection could not be added because the `from` or `to` neurons were undefined"
      );
    }

    fromNeuron.outbound_connections.push(connection);
    toNeuron.inbound_connections.push(connection);
    this.connections.push(connection);
  }

  serialize() {
    const json = { neurons: [], connections: [] };

    for (let [id, neuron] of this.neurons) {
      const { bias, type, outbound_connections } = neuron;

      json.neurons.push({
        id,
        bias,
        type
      });

      json.connections.push(
        ...outbound_connections.map(({ from, to, weight, enabled }) => ({
          from: from.id,
          to: to.id,
          weight,
          enabled
        }))
      );
    }

    return json;
  }

  /**
   * Activate the network (feed-forward only)
   * @param inputs
   */
  activate(inputs) {
    const [state0, state1] = this.state;

    this.inputs.map((input, i) => {
      state0[input.id] = inputs[i];
      state1[input.id] = inputs[i];
    });

    const done = new Set();
    const stack = [...this.inputs];

    while (stack.length) {
      const neuron = stack.shift();

      if (done.has(neuron)) continue;

      if (neuron.inbound_connections.length) {
        const dotProduct = neuron.inbound_connections.reduce(
          (sum, connection) =>
            (sum + state0[connection.from.id]) * connection.weight,
          0
        );

        state1[neuron.id] = this.activation(dotProduct + neuron.bias);
      }

      done.add(neuron);

      stack.push(
        ...neuron.outbound_connections
          .filter((connection) => stack.indexOf(connection.to) === -1)
          .map((connection) => connection.to)
      );
    }

    this.state.reverse();

    return this.outputs.map((output) => state1[output.id]);
  }
}
