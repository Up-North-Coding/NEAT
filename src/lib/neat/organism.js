import Genome from "./genome.js";
import ConnectionGene from "./gene-connection.js";
import Network from "../neural-net/network.js";
import { ascending } from "./utils.js";

/**
 * Organisms are Genomes and Networks with fitness informations
 */
class Organism {
  /**
   * A measure of fitness for the organism
   */
  fitness = 0;
  /**
   * A measure of fitness before adjustment
   */
  originalFitness = 0;
  /**
   * The organism's species
   */
  species = null;
  /**
   * Mark for killing
   */
  kill = false;
  /**
   * Generation in which Organism is from
   */
  generation = 0;
  /**
   * Number of children this Organism may have
   */
  expectedOffspring = 0;
  /**
   * The Genome associated with this Organism
   */
  genome = null;
  /**
   * The neural net associated with the Genome
   */
  network = null;

  constructor(fitness = 0, generation = 0) {
    this.fitness = fitness;
    this.generation = generation;
  }

  copy(fitness = 0, generation = 0) {
    let clone = new Organism();
    clone.fitness = fitness;
    clone.generation = generation;
    clone.originalFitness = this.originalFitness;
    clone.genome = this.genome.copy();

    return clone;
  }

  getNetwork() {
    if (!this.network) {
      const nodes = Array.from(this.genome.nodes.values()).map(
        ({ type, id }) => ({
          type,
          id
        })
      );

      const connections = Array.from(this.genome.connections.values())
        .sort(ascending((i) => i.innovation))
        .map(({ from, to, weight, enabled }) => ({
          from: from.id,
          to: to.id,
          weight: weight,
          enabled: enabled
        }));

      this.network = new Network(nodes, connections);
    }

    return this.network;
  }
}

export default Organism;
