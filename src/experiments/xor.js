import Network from "../lib/neural-net/network.js";
import DefaultConfig from "../lib/neat/default-config.js";
import Population from "../lib/neat/population.js";
import Organism from "../lib/neat/organism.js";
import NodeGene from "../lib/neat/gene-node.js";
import ConnectionGene from "../lib/neat/gene-connection.js";
import { NodeTypes } from "../lib/neural-net/neuron.js";
import readline from "readline";

const testData = [
  [[0, 0, 1], 0],
  [[0, 1, 1], 1],
  [[1, 0, 1], 1],
  [[1, 1, 1], 0]
];

let config = {
  ...DefaultConfig,
  populationSize: 1500,
  fitnessThreshold: 15.9
  //adjustCompatibilityThreshold: false,
  //compatibilityModifierTarget: 30,
  //feedForwardOnly: true,
  //excessCoefficient: 2,
  //disjointCoefficient: 0.5,
  //weightDifferenceCoefficient: 1
  // compatibilityThreshold: 4,
  // genomeWeightPerturbated: 0.9,
  // dropoffAge: 100
};

let nodes = [
  new NodeGene("input0", NodeTypes.Input),
  new NodeGene("input1", NodeTypes.Input),
  new NodeGene("output", NodeTypes.Output)
];
let connections = [
  new ConnectionGene(nodes[0], nodes[2]),
  new ConnectionGene(nodes[1], nodes[2])
];
let lastGeneration = 0;

const computeFitness = function (network, organism, population) {
  let fitness = 4;
  testData.sort(() => Math.random() - 0.5);

  testData.forEach(([inputs, expected]) => {
    let [output] = network.activate(inputs);
    output = Math.round(output);
    fitness -= Math.abs(output - expected);
  });

  return fitness ** 2;
};

let totalGen = 0,
  totalFitness = 0,
  totalNodes = 0,
  totalConnections = 0,
  totalSpecies = 0,
  failures = 0;

const testRun = 30;

const runTest = async () => {
  console.log("Running...");
  for (let i = 0; i < testRun; i++) {
    let pop = Population.from(config, {
      nodes,
      connections
    });

    try {
      const solution = await pop.run(computeFitness, 300, () => {
        readline.clearLine(process.stdout);
        console.log(
          `Run ${i}, Generation ${pop.generation} Champ: ${
            pop.getSuperChamp()?.fitness
          }`
        );
        readline.moveCursor(process.stdout, 0, -1);
      });
      readline.clearLine(process.stdout);
      console.log(
        `Run ${i}, Generation ${pop.generation} Champ: ${solution.fitness} - Nodes: ${solution.genome.nodes.size}, Connections: ${solution.genome.connections.size}`
      );

      totalGen += pop.generation;
      totalFitness += solution.fitness;
      totalNodes += solution.genome.nodes.size;
      totalConnections += solution.genome.connections.size;
      totalSpecies += pop.species.length;
    } catch (e) {
      console.log("Error:", e.stack);
      failures++;
    }
  }
  let n = testRun - failures;
  console.log("Average generations", totalGen / n);
  console.log("Average species", totalSpecies / n);
  console.log("Average fitness", totalFitness / n);
  console.log("Average nodes", totalNodes / n);
  console.log("Average connections", totalConnections / n);
  console.log("failures", failures);
};

runTest();
