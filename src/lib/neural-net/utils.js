const sigmoid_slope = 4.924273;
export const sigmoid = (x, slope = sigmoid_slope) =>
  1 / (1 + Math.exp(-slope * x));
