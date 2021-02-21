import { v4 as uuid } from "uuid";
import { NodeTypes } from "../neural-net/neuron.js";

class NodeGene {
  id = "";
  type = null;

  constructor(id = uuid(), type = NodeTypes.Other) {
    this.id = id;
    this.type = type;
  }

  copy() {
    return new NodeGene(this.id, this.type);
  }

  static isSensor(gene) {
    return gene.type === NodeTypes.Input || gene.type === NodeTypes.Bias;
  }

  static isOutput(gene) {
    return gene.type === NodeTypes.Output;
  }
}

export default NodeGene;
