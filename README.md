# Goals

First and foremost, this library is meant to make NEAT a more accessible algorithm to use. There are currently many unmaintained libraries of varying levels of difficulty and documentation - this is a library that looks to take many lessons learned from many libraries to make a better one with first class support for modern visualization techniques, distributed computing (via WASM support in browsers), and interactive computation.

# Credits

The initial NEAT implementation is heavily inspired by the excellent work done in [@alenaksu/neatjs](https://github.com/alenaksu/neatjs) -- I highly recommend checking out the demo at https://alenaksu.github.io/neatjs/. The core of this library is a re-implementation of that NEAT library in ES6 JavaScript, as TypeScript has a high learning curve and the goal of this library is to be simple to use.

# Features Implemented

 - [ ] Core NEAT Functionality
 - [ ] Compositional Pattern Producing Networks
 - [ ] HyperNEAT
 - [ ] Interactive Computation Framework
 - [ ] WASM support (perhaps in a different library as a monkey patch?)
 
# References

 - [NEAT Home Page](https://www.cs.ucf.edu/~kstanley/neat.html)
