'use strict';

/**
 * Plot result from the beam analysis calculation into a graph
 */
class AnalysisPlotter {
  constructor(container) {
    this.container = container;
  }

  /**
   * Plot equation.
   *
   * @typedef {Object} BeamAnalysisData Beam analysis data
   * @property {Beam} beam Beam object
   * @property {Number} load Load value in float
   * @property {Function} equation Equation function
   *
   * @param {BeamAnalysisData} data The equation data
   */
  plot(data) {
    console.log('Plotting data : ', data);
  }
}
