import Organism from "./organism.js";
import Genome from "./genome.js";
import Population from "./population.js";
import {
  rand,
  getRandomItems,
  descending,
  gaussian,
  wrapNumber
} from "./utils.js";

class Species {
  /**
   * The organisms of the species
   */
  organisms = [];
  /**
   * Representative of the species (random)
   */
  specimen = null;
  /**
   * Mark the species for extinction
   */
  extinct = false;
  /**
   * Species' age
   */
  age = 0;
  /**
   * Age from last improvement
   */
  ageOfLastImprovement = 0;
  /**
   * Max fitness ever
   */
  maxFitness = 0;
  /**
   * Average fitness
   */
  averageFitness = 0;
  /**
   * Number of expected offspring in proportion to the sum of adjusted fitnesses
   */
  expectedOffspring = 0;

  addOrganism(organism) {
    if (!(organism instanceof Organism)) {
      throw new Error(`Species.addOrganism requires an Organism`);
    }

    if (!this.specimen) {
      this.specimen = organism;
    }

    this.organisms.push(organism);
    organism.species = this;
  }

  removeOrganism(organism) {
    const index = this.organisms.indexOf(organism);
    if (index !== -1) {
      this.organisms.splice(index, 1);
    }
  }

  getSpecimen() {
    return this.specimen;
  }

  getChampion() {
    return this.organisms[0];
  }

  adjustFitness(config) {
    let totalFitness = 0;
    this.extinct = this.age - this.ageOfLastImprovement + 1 > config.dropoffAge;

    this.organisms.forEach((organism) => {
      organism.originalFitness = organism.fitness;

      if (this.extinct) {
        // Penalty for a long period of stagnation (divide fitness by 100)
        organism.fitness *= 0.01;
      }

      if (this.age <= 10) {
        // boost young organisms
        organism.fitness *= config.ageSignificance;
      }

      // Simplified version of explicit fitness sharing designed to punish species that get too big
      organism.fitness =
        Math.max(organism.fitness, 0.0001) / this.organisms.length;

      totalFitness += organism.originalFitness;
    });

    this.organisms.sort(descending((i) => i.fitness));
    [this.specimen] = getRandomItems(this.organisms, 1);

    this.averageFitness = totalFitness / this.organisms.length;

    // update age of last improvement
    if (this.organisms[0].originalFitness > this.maxFitness) {
      this.maxFitness = this.organisms[0].originalFitness;
      this.ageOfLastImprovement = this.age;
    }

    const removeFrom = Math.floor(
      this.organisms.length * config.survivalThreshold + 1
    );

    for (let i = removeFrom; i < this.organisms.length; i++) {
      this.organisms[i].kill = true;
    }
  }

  /**
   * Perform mating and mutation and speciates the specimens with the appropriate generation number. Does not remove old generation.
   * The sorted_species is ordered to have best species in the beginning.
   * @param generation
   */
  reproduce(config, generation, superChamp, sortedSpecies) {
    if (this.expectedOffspring === 0 || this.organisms.length === 0) {
      return;
    }

    const [...babies] = this.organisms;
    const champ = babies[0];
    let champAdded = false;

    for (let i = 0; i < this.expectedOffspring; i++) {
      let baby = new Organism(0, generation);

      if (
        superChamp &&
        superChamp === champ &&
        superChamp?.expectedOffspring > 0
      ) {
        // If we have a population champion, finish off some special clones
        let organism = superChamp.copy(0, generation);

        if (superChamp.expectedOffspring === 1) {
          organism = Genome.mutateGenome(organism.genome, config);
        }

        superChamp.expectedOffspring--;

        baby = organism;
      } else if (!champAdded && this.expectedOffspring > 5) {
        // Champion of species with more than 5 networks is copied unchanged
        baby = champ.copy(0, generation);
        champAdded = true;
      } else if (rand() < config.mutateOnlyProbability) {
        // Mutate only
        const [mom] = getRandomItems(babies, 1);

        baby.genome = Genome.mutateGenome(
          mom.copy(0, generation).genome,
          config
        );
      } else {
        // mate
        const [mom] = getRandomItems(babies, 1);
        let dad;

        if (rand() > config.interspeciesMateRate) {
          [dad] = getRandomItems(babies, 1);
        } else {
          // Interspecies mate
          let tries = 0,
            randomSpecies = this;

          while (randomSpecies === this && tries++ < 5) {
            const species = Species.getRandomSpecies(sortedSpecies);
            if (species.organisms.length) {
              randomSpecies = species;
            }
          }

          dad = randomSpecies.getChampion();
        }

        baby.genome = Genome.crossover(dad.genome, mom.genome, config);

        if (
          rand() < config.mutateOnlyProbability ||
          Genome.compatibility(mom.genome, dad.genome, config) === 0
        ) {
          Genome.mutateGenome(baby.genome, config);
        }
      }

      baby.generation = generation;
      Species.speciateOrganism(config, baby, sortedSpecies);
    }
  }

  /**
   * Returns a random species form the given set, tending towards better species
   * @param sortedSpecies A sorted set of species
   */
  static getRandomSpecies(sortedSpecies) {
    const random = Math.min(Math.round(gaussian().next().value), 1);
    const index = wrapNumber(0, sortedSpecies.length - 1, random);
    // const multiplier = Math.min(gaussian().next().value / 4, 1);
    // const index = Math.floor(multiplier * (species.length - 1) + 0.5);

    return sortedSpecies[index];
  }

  /**
   * Puts the organism inside a compatible species
   * @param config
   * @param organism
   * @param species
   */
  static speciateOrganism(config, organism, allSpecies) {
    const { compatibilityThreshold } = config;

    const found =
      allSpecies.length > 0 &&
      allSpecies.some((species) => {
        if (!species.organisms.length) {
          return false;
        }

        const isCompatible =
          Genome.compatibility(
            organism.genome,
            species.getSpecimen().genome,
            config
          ) < compatibilityThreshold;

        if (isCompatible) {
          species.addOrganism(organism);
        }

        return isCompatible;
      });

    if (!found) {
      const species = new Species();
      species.addOrganism(organism);
      allSpecies.push(species);
    }
  }
}

export default Species;
