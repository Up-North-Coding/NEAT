import Species from "./species.js";
import Organism from "./organism.js";
import Network from "../neural-net/network.js";
import ConnectionGene from "./gene-connection.js";
import NodeGene from "./gene-node.js";
import DefaultConfig from "./default-config.js";
import { descending } from "./utils.js";

class Population {
  size = 0;
  species = [];
  organisms = [];
  config = null;
  generation = 1;

  constructor(config = DefaultConfig) {
    this.size = config.populationSize;
    this.config = config;
  }

  static from(config, { nodes, connections }) {
    const population = new Population(config);
    const organism = new Organism();

    for (let node of nodes) {
      organism.genome.addNode(node);
    }

    for (let connection of connections) {
      organism.genome.addConnection(config, connection);
    }

    const size = config.populationSize;
    for (let i = 0; i < size; i++) {
      const organismCopy = organism.copy();
      organismCopy.genome.mutateConnectionsWeights(config);
      population.addOrganism(organismCopy);
    }

    population.speciate();

    return population;
  }

  getSuperChamp() {
    return this.organisms.length
      ? this.organisms.reduce((champ, organism) =>
          organism.fitness > champ.fitness ? organism : champ
        )
      : null;
  }

  addOrganism(organism) {
    this.organisms.push(organism);
  }

  removeOrganism(organism) {
    const index = this.organisms.indexOf(organism);
    if (index !== -1) {
      this.organisms.splice(index, 1);
    }
  }

  speciate() {
    for (let organism of this.organisms) {
      Species.speciateOrganism(this.config, organism, this.species);
    }
  }

  epoch() {
    this.generation++;

    const { species, config, generation } = this;

    const organisms = [...this.organisms];

    // Adjust compatibility threshold
    if (
      config.adjustCompatibilityThreshold &&
      species.length !== config.compatibilityModifierTarget
    ) {
      config.compatibilityThreshold +=
        -config.compatibilityModifier *
        (species.length > config.compatibilityModifierTarget ? -1 : 1);

      config.compatibilityThreshold = Math.max(
        config.compatibilityThreshold,
        config.compatibilityModifier
      );
    }

    let overallAverage = 0;
    // Adjust fitness of species' organisms
    for (let specie of species) {
      specie.adjustFitness(config);
      overallAverage += specie.averageFitness;
    }

    for (let organism of organisms) {
      // Remove all organisms marked for death
      if (organism.kill) {
        this.removeOrganism(organism);
        organism.species.removeOrganism(organism);
      } else {
        // TODO: is this right?
        organism.expectedOffspring = Math.round(
          organism.originalFitness / overallAverage
        );
      }
    }

    const sortedSpecies = [...species].sort(descending((i) => i.maxFitness));

    let superChamp = this.getSuperChamp();

    // Reproduce all species
    for (let specie of sortedSpecies) {
      specie.expectedOffspring = Math.round(
        (specie.averageFitness / overallAverage) * this.size
      );
      specie.reproduce(config, generation, superChamp, sortedSpecies);
    }

    // Remove all the organism from the old generation
    for (let organism of [...this.organisms]) {
      this.removeOrganism(organism);
      organism.species.removeOrganism(organism);
    }

    // Add species' organisms to current generation
    this.species = species.filter((species) => {
      // Remove empty species
      if (species.organisms.length === 0) {
        return false;
        // Add organisms to population
      } else {
        this.organisms.push(...species.organisms);
      }

      species.age++;

      return true;
    });
  }

  run(fitnessFn, maxRuns = Infinity, update = () => null) {
    return new Promise(async (resolve, reject) => {
      const isInfinite = !Number.isFinite(maxRuns);
      while (isInfinite || maxRuns--) {
        for (const organism of this.organisms) {
          const network = organism.getNetwork();
          organism.fitness = await fitnessFn(network, organism, this);

          if (organism.fitness >= this.config.fitnessThreshold) {
            return resolve(organism);
          }
        }

        update(this);
        this.epoch();
      }
      reject();
    });
  }
}

export default Population;
