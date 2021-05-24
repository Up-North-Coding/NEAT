import Network from "../lib/neural-net/network.js";
import DefaultConfig from "../lib/neat/default-config.js";
import { Population } from "../lib/neat/population.js";
import { Organism } from "../lib/neat/organism.js";
import { NodeGene } from "../lib/neat/gene-node.js";
import { ConnectionGene } from "../lib/neat/gene-connection.js";

const testData = [
  [[0, 0, 1], 0],
  [[0, 1, 1], 1],
  [[1, 0, 1], 1],
  [[1, 1, 1], 0]
];

let config = {
  ...DefaultConfig,
  populationSize: 1500,
  fitnessThreshold: 15.9,
  adjustCompatibilityThreshold: true,
  compatibilityModifierTarget: 30,
  feedForwardOnly: true,
  excessCoefficient: 2,
  disjointCoefficient: 0.5,
  weightDifferenceCoefficient: 1
  // compatibilityThreshold: 4,
  // genomeWeightPerturbated: 0.9,
  // dropoffAge: 100
};

let nodes = [
  new NodeGene(NodeType.Input, "0"),
  new NodeGene(NodeType.Input, "1"),
  new NodeGene(NodeType.Output, "output")
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
    const [output] = network.activate(inputs);
    fitness -= Math.abs(output - expected);
  });

  return fitness ** 2;
};

let avgGen = 0,
  avgFitness = 0,
  avgNodes = 0,
  avgConnections = 0,
  avgSpecies = 0,
  failures = 0;
const testRun = 30;

const runTest = async () => {
  console.log("Running...");
  for (let i = 0; i < testRun; i++) {
    let pop = Population.from(config, {
      nodes,
      connections
    });

    await pop
      .run(computeFitness, 300)
      .then((org) => {
        if (org.fitness > 16) throw JSON.stringify(org);

        avgGen += org.generation;
        avgFitness += org.fitness;
        avgNodes += org.nodes.size;
        avgConnections += org.connections.size;
        avgSpecies += pop.species.length;

        process.stdout.write(".");
      })
      .catch(() => {
        failures++;
        process.stdout.write("x");
      });
  }
  process.stdout.write("\n");
  let n = testRun - failures;
  console.log("avg generations", avgGen / n);
  console.log("avg species", avgSpecies / n);
  console.log("avg fitness", avgFitness / n);
  console.log("avg nodes", avgNodes / n);
  console.log("avg connections", avgConnections / n);
  console.log("failures", failures);
};

runTest();
