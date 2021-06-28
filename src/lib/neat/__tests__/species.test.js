import Species from "../species.js";
import Organism from "../organism.js";
import Genome from "../genome.js";
import NodeGene from "../gene-node.js";
import ConnectionGene from "../gene-connection.js";
import { NodeTypes } from "../../neural-net/neuron.js";
import DefaultConfig from "../default-config.js";

const setup_test_species = () => {
  const species = new Species();
  return species;
};

const setup_test_organism = () => {
  const organism = new Organism();
  const genome = new Genome();
  const input1 = new NodeGene(1, NodeTypes.Input);
  const input2 = new NodeGene(2, NodeTypes.Input);
  const input3 = new NodeGene(3, NodeTypes.Input);
  const output1 = new NodeGene(4, NodeTypes.Output);
  const connection1 = new ConnectionGene(input1, output1);
  const connection2 = new ConnectionGene(input2, output1);

  genome.addNode(input1);
  genome.addNode(input2);
  genome.addNode(input3);
  genome.addNode(output1);
  genome.addConnection(DefaultConfig, connection1);
  genome.addConnection(DefaultConfig, connection2);
  organism.genome = genome;

  return {
    organism,
    nodes: [input1, input2, input3, output1],
    connections: [connection1, connection2]
  };
};

describe("The species class", () => {
  test("addOrganism() should add an organism", () => {
    const species = setup_test_species();
    const { organism } = setup_test_organism();
    species.addOrganism(organism);

    expect(species.specimen).toBe(organism);
    expect(species.organisms.length).toEqual(1);
    expect(organism.species).toBe(species);
  });

  test("addOrganism() should throw an error when the argument is not an Organism", () => {
    const species = setup_test_species();
    expect(() => species.addOrganism(3)).toThrow();
  });

  test("removeOrganism() should remove an organism", () => {
    const species = setup_test_species();
    const { organism: organism1 } = setup_test_organism();
    const { organism: organism2 } = setup_test_organism();
    const { organism: organism3 } = setup_test_organism();
    species.addOrganism(organism1);
    species.addOrganism(organism2);
    species.addOrganism(organism3);
    species.removeOrganism(organism2);

    expect(species.organisms.length).toEqual(2);
    expect(species.organisms.indexOf(organism2)).toEqual(-1);
  });

  test("getSpecimen() should return a specimen of the species", () => {
    const species = setup_test_species();
    const { organism } = setup_test_organism();
    species.addOrganism(organism);

    expect(species.getSpecimen()).toBe(organism);
  });

  test("getChampion() should return the best organism (first one in descending fitness order)", () => {
    const species = setup_test_species();
    const { organism: organism1 } = setup_test_organism();
    const { organism: organism2 } = setup_test_organism();
    const { organism: organism3 } = setup_test_organism();
    species.addOrganism(organism1);
    species.addOrganism(organism2);
    species.addOrganism(organism3);

    expect(species.getChampion()).toBe(organism1);
  });

  test("adjustFitness() should affect each individual's fitness, kill unfit organisms, and sort in descending order of fitness", () => {
    const species = setup_test_species();
    const { organism: organism1 } = setup_test_organism();
    organism1.fitness = 20;
    const { organism: organism2 } = setup_test_organism();
    organism2.fitness = 10;
    const { organism: organism3 } = setup_test_organism();
    organism3.fitness = 30;
    species.addOrganism(organism1);
    species.addOrganism(organism2);
    species.addOrganism(organism3);

    species.adjustFitness(DefaultConfig);

    expect(species.organisms[0]).toBe(organism3);
    expect(species.organisms[1]).toBe(organism1);
    expect(species.organisms[2]).toBe(organism2);
    expect(species.organisms[0].kill).toEqual(false);
    expect(species.organisms[1].kill).toEqual(true);
    expect(species.organisms[2].kill).toEqual(true);
  });

  test("reproduce() should return a new list of baby organisms", () => {
    const species = setup_test_species();
    const { organism: organism3 } = setup_test_organism();
    organism3.fitness = 30;
    const { organism: organism1 } = setup_test_organism();
    organism1.fitness = 20;
    const { organism: organism2 } = setup_test_organism();
    organism2.fitness = 10;
    species.addOrganism(organism1);
    species.addOrganism(organism2);
    species.addOrganism(organism3);

    species.expectedOffspring = 10000;
    const allSpecies = [species];

    // This will create a new generation according to the config and speciate it according to compatibility threshold
    species.reproduce(DefaultConfig, 1, null, allSpecies);

    // Sum up organisms across all species to reach expectedOffspring + original population
    const total_organisms = allSpecies.reduce(
      (sum, species) => sum + species.organisms.length,
      0
    );

    expect(total_organisms).toEqual(species.expectedOffspring + 3);
  });
});
