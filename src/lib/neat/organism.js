//import Species from './species.js';
import Genome from "./genome.js";
import ConnectionGene from "./gene-connection.js";
import Network from "../neural-net/network.js";
import { ascending } from "./utils.js";

/**
 * Organisms are Genomes and Networks with fitness informations
 * i.e. The genotype and phenotype together
 */
class Organism extends Genome {
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
  network = null;

  constructor(fitness = 0, generation = 0) {
    super();
    this.fitness = fitness;
    this.generation = generation;
  }

  copy(fitness = 0, generation = 0) {
    let clone = super.copy();
    clone.fitness = fitness;
    clone.generation = generation;
    clone.originalFitness = this.originalFitness;

    return clone;
  }

  getNetwork() {
    if (!this.network) {
      const nodes = Array.from(this.nodes.values()).map(({ type, id }) => ({
        type,
        id
      }));

      const connections = Array.from(this.connections.values())
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
