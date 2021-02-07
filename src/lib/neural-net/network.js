import Neuron from "./neuron.js";
import Connection from "./connection.js";
//import { sigmoid } from "../utils";

export default class Network {
  inputs = [];
  outputs = [];
  neurons = new Map();
  //activation = sigmoid;
  state = [{}, {}];
  connections;

  constructor(input_neurons = [], output_neurons = [], connections = []) {
    if (!Array.isArray(input_neurons)) {
      throw new Error(
        "Network constructor requires an array as the first argument"
      );
    }

    if (!Array.isArray(output_neurons)) {
      throw new Error(
        "Network constructor requires an array as the second argument"
      );
    }

    if (!Array.isArray(connections)) {
      throw new Error(
        "Network constructor requires an array as the third argument"
      );
    }

    for (let neuron of input_neurons) {
      if (!(neuron instanceof Neuron) && neuron?.id === undefined) {
        throw new Error(
          "Network constructor requires an array of {} with ID property or Neurons"
        );
      }

      this.addInputNeuron(
        neuron instanceof Neuron ? neuron : new Neuron(neuron.id)
      );
    }

    for (let neuron of output_neurons) {
      if (!(neuron instanceof Neuron) && neuron?.id === undefined) {
        throw new Error(
          "Network constructor requires an array of {} with ID property or Neurons"
        );
      }

      let output_neuron = this.addOutputNeuron(
        neuron instanceof Neuron ? neuron : new Neuron(neuron.id)
      );
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
          : new Connection(connection.from, connection.to)
      );
    }

    /*links
            .filter(({ enabled }) => enabled)
            .forEach(({ from, to, weight, enabled }) => {
                const fromNeuron = this.neurons.get(from)!;
                const toNeuron = this.neurons.get(to)!;
                const link = new Link(fromNeuron, toNeuron, weight, enabled);

                fromNeuron.out.push(link);
                toNeuron.in.push(link);
            });*/
    //this.inputs = inputs;
    //this.outputs = outputs;
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

    this.neurons.set(neuron.id, neuron);
    this.state[0][neuron.id] = 0;
    this.state[1][neuron.id] = 0;
  }

  /**
   * Adds a neuron to the neural network and adds it to the inputs
   * @param neuron
   */
  addInputNeuron(neuron) {
    this.addNeuron(neuron);
    this.inputs.push(neuron);
  }

  /**
   * Adds a neuron to the neural network and adds it to the outputs
   * @param neuron
   */
  addOutputNeuron(neuron) {
    this.addNeuron(neuron);
    this.outputs.push(neuron);
  }

  /**
   * Adds a connection to the neural network
   * @param connection
   */
  addConnection(connection) {
    const fromNeuron = this.neurons.get(connection.from);
    const toNeuron = this.neurons.get(connection.to);

    if (fromNeuron === undefined || toNeuron === undefined) {
      throw new Error(
        "The connection could not be added because the `from` or `to` neurons were undefined"
      );
    }

    fromNeuron.out.push(connection);
    toNeuron.in.push(connection);
  }

  toJSON() {
    const neruons = this.neurons;
    const neurons = [],
      links = [];

    neruons.forEach(({ id, bias, type, out }) => {
      neurons.push({
        id,
        bias,
        type
      });
      links.push(
        ...out.map(({ from, to, weight, enabled }) => ({
          from: from.id,
          to: to.id,
          weight,
          enabled
        }))
      );
    });

    return {
      // config,
      neurons,
      links
    };
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

      if (neuron.in.length) {
        const dotProduct = neuron.in.reduce(
          (sum, link) => (sum + state0[link.from.id]) * link.weight,
          0
        );

        state1[neuron.id] = this.activation(dotProduct + neuron.bias);
      }
      done.add(neuron);
      stack.push(
        ...neuron.out
          .filter((l) => stack.indexOf(l.to) === -1)
          .map((link) => link.to)
      );
    }

    this.state.reverse();
    return this.outputs.map((output) => state1[output.id]);
  }
}
