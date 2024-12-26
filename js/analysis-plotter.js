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
 * @param {Boolean?} isPrimarySpan is x value is on primary span / left span side
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
        type: 'scatter',
        data: {
          datasets: [
            {
              data: [],
              label: this.container.id,
              showLine: true,
              fill: false,
              borderColor: 'red',
            },
          ],
        },
      });
    }

    return this.chart;
  }

  /**
   * @typedef {Object} XValues X values object structure
   * @property {Number} value X value
   * @property {Boolean} isPrimarySpan Is x value is on primary span / left span side
   */

  /**
   * Get x values for simply supported beam condition
   *
   * @param {Beam} beam Beam object
   * @param {Number} [segmentSize=10] Number of segments, default is 10
   *
   * @returns {XValues[]} X values
   */
  getSimplyXValues(beam, segmentSize = 10) {
    /**
     * @type {XValues[]}
     */
    const xValues = [];
    const totalLength = beam.primarySpan;
    const perSegmentLength = totalLength / segmentSize;

    let x = 0;

    for (let i = 0; x < totalLength; i++) {
      if (i === 0) {
        xValues.push({
          value: 0,
          isPrimarySpan: true,
        });
        continue;
      }

      const previousX = xValues[i - 1]?.value || 0;
      x = previousX + perSegmentLength;

      if (x > totalLength) {
        x = totalLength;
      }

      xValues.push({
        value: x,
        isPrimarySpan: true,
      });
    }

    return xValues;
  }

  /**
   * Get x values for two-span unequal beam condition
   *
   * @param {Beam} beam Beam object
   * @param {Number} [segmentSize=10] Number of segments, default is 10
   *
   * @returns {XValues[]}
   */
  getTwoSpanUnequalXValues(beam, segmentSize = 10) {
    /**
     * @type {XValues[]}
     */
    const xValues = [];
    const totalLength = beam.primarySpan + beam.secondarySpan;
    const perSegmentLength = totalLength / segmentSize;

    let isOnSecondarySpan = false;
    let x = 0;

    for (let i = 0; x < totalLength; i++) {
      if (i === 0) {
        xValues.push({
          value: 0,
          isPrimarySpan: true,
        });
        continue;
      }

      const previousX = xValues[i - 1]?.value || 0;
      x = previousX + perSegmentLength;

      if (x > totalLength) {
        x = totalLength;
      }

      if (isOnSecondarySpan) {
        xValues.push({
          value: x,
          isPrimarySpan: false,
        });
        continue;
      }

      const isMoreLengthThanPrimarySpan = x > beam.primarySpan;
      const isPreviousIsSameAsPrimarySpan = previousX === beam.primarySpan;

      if (isMoreLengthThanPrimarySpan && !isPreviousIsSameAsPrimarySpan) {
        x = beam.primarySpan;
      }

      if (isMoreLengthThanPrimarySpan && isPreviousIsSameAsPrimarySpan) {
        x = beam.primarySpan;
        isOnSecondarySpan = true;
      }

      if (x > totalLength) {
        x = totalLength;
      }

      xValues.push({
        value: x,
        isPrimarySpan: !isOnSecondarySpan,
      });
    }

    return xValues;
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

    const xValues = isSimplyCondition
      ? this.getSimplyXValues(beam)
      : this.getTwoSpanUnequalXValues(beam);

    this.getChartInstance().data.datasets[0].data = xValues.map((x) => {
      const result = isSimplyCondition
        ? equation(x.value)
        : equation(x.value, x.isPrimarySpan);

      return result;
    });

    this.getChartInstance().update();
  }
}
