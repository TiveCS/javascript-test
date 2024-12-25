'use strict';

/**
 * @type {import('chart.js').Chart}
 *
 * @typedef {Object} FnPlotEquationResult Plot equation result
 * @property {Number} x X value
 * @property {Number} y Y value
 *
 * @callback FnPlotEquation Plot equation function
 * @param {Number} x X value
 * @returns {FnPlotEquationResult} Plot equation result
 */

/**
 * Plot result from the beam analysis calculation into a graph
 */
class AnalysisPlotter {
  /**
   * @param {String} canvasId Chart container ID
   */
  constructor(canvasId) {
    /**
     * @type {HTMLCanvasElement} Chart container
     * @public
     */
    this.container = document.getElementById(canvasId);

    if (!this.container) {
      throw new Error(`Canvas element with ID ${canvasId} not found`);
    }

    /**
     * @type {Chart}
     * @public
     */
    this.chart = null;
  }

  getChartInstance() {
    if (!this.chart) {
      this.chart = new Chart(this.container, {
        type: 'bubble',
        data: {
          labels: [this.container.id],
          datasets: [
            {
              label: this.container.id,
              data: [],
            },
          ],
        },
      });
    }

    return this.chart;
  }

  /**
   * Plot equation.
   *
   * @typedef {Object} BeamAnalysisData Beam analysis data
   * @property {AnalysisCondition} condition Analysis condition
   * @property {Beam} beam Beam object
   * @property {Number} load Load value in float
   * @property {FnPlotEquation} equation Equation function
   *
   * @param {BeamAnalysisData} data The equation data
   */
  plot({ beam, condition, equation, load }) {
    // console.log('Plotting data : ', data);

    const isSimplyCondition = condition === 'simply-supported';

    const xValues = [];
    const segmentSize = 10;

    const totalLength = isSimplyCondition
      ? beam.primarySpan
      : beam.primarySpan + beam.secondarySpan;
    const perSegmentLength = totalLength / segmentSize;

    for (let i = 0; i <= segmentSize; i++) {
      if (i === 0) {
        xValues.push(0);
        continue;
      }

      const previousX = xValues[i - 1] || 0;
      const x = previousX + perSegmentLength;
      xValues.push(x);
    }

    this.getChartInstance().data.datasets[0].data = xValues.map((x) => {
      return {
        x,
        y: equation(x).y,
        r: 8,
      };
    });

    this.getChartInstance().update();
  }
}
