import Population from "../population.js";
import NodeGene from "../gene-node.js";
import ConnectionGene from "../gene-connection.js";
import DefaultConfig from "../default-config.js";
import { NodeTypes } from "../../neural-net/neuron.js";

const setup_population = (config = DefaultConfig) => {
  let nodes = [
    new NodeGene(NodeTypes.Input, "0"),
    new NodeGene(NodeTypes.Input, "1"),
    new NodeGene(NodeTypes.Output, "output")
  ];

  let connections = [
    new ConnectionGene(nodes[0], nodes[2]),
    new ConnectionGene(nodes[1], nodes[2])
  ];

  let pop = Population.from(config, {
    nodes,
    connections
  });

  return pop;
};

describe("The population class", () => {
  test("from() should create a population of the appropriate size", () => {
    const population = setup_population();
    expect(population.size).toEqual(DefaultConfig.populationSize);
  });

  test("getSuperChamp() should get the highest fitness individual from the population", () => {
    const test_fitness = 13;
    const population = setup_population();
    population.organisms[
      population.organisms.length / 2
    ].originalFitness = test_fitness;
    const superChamp = population.getSuperChamp();
    expect(superChamp.originalFitness).toEqual(test_fitness);
  });

  test("removeOrganism() should remove the organism by reference", () => {
    const population = setup_population();
    const organism_to_remove = population.organisms[13];
    population.removeOrganism(organism_to_remove);
    expect(population.organisms.length).toEqual(
      DefaultConfig.populationSize - 1
    );
    expect(population.organisms.indexOf(organism_to_remove)).toEqual(-1);
  });

  test("run() should do evolution with computeFitness as the fitness function", async () => {
    const computeFitness = function (network, organism, population) {
      const fitness = Math.random() * 10;
      return fitness;
    };

    const threshold = 9.99;
    const population = setup_population({
      ...DefaultConfig,
      fitnessThreshold: threshold
    });

    const best_boi = await population.run(computeFitness, 300);
    expect(best_boi.fitness).toBeGreaterThan(threshold);
  });
});
