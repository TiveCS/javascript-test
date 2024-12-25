'use strict';

/** ============================ Beam Analysis Data Type ============================ */

class Material {
  /**
   * Beam material specification.
   *
   * @param {String} name         Material name
   * @param {Object} properties   Material properties {EI : 0, GA : 0, ....}
   */
  constructor(name, properties) {
    /**
     * @type {String} Material name
     * @public
     */
    this.name = name;

    /**
     * @type {Object} Material properties
     * @public
     */
    this.properties = properties;
  }
}

class Beam {
  /**
   * @param {Number} primarySpan          Beam primary span length
   * @param {Number} secondarySpan        Beam secondary span length
   * @param {Material} material           Beam material object
   */
  constructor(primarySpan, secondarySpan, material) {
    /**
     * @type {Number} Beam primary span length
     * @public
     */
    this.primarySpan = primarySpan;

    /**
     * @type {Number} Beam secondary span length
     * @public
     */
    this.secondarySpan = secondarySpan;

    /**
     * @type {Material} Beam material object
     * @public
     */
    this.material = material;
  }
}

/** ============================ Beam Analysis Class ============================ */

/**
 * @typedef {'simply-supported' | 'two-span-unequal'} AnalysisCondition analysis condition
 */

/**
 * @typedef {Object} FnEquationResult Equation result
 * @property {Number} x X value which is the distance from the left support
 * @property {Number} y Y value which is the value of the equation
 *
 * @callback FnEquation
 * @param {Number} x X value which is the distance from the left support
 * @returns {FnEquationResult} Equation result returning chart coordinates
 */

/**
 * @callback FnGetShearForceEquation Get shear force equation function
 * @param {Beam} beam Beam object
 * @param {Number} load Load
 * @returns {FnEquation} Shear force equation
 */

/**
 * @callback FnGetBendingMomentEquation Get bending moment equation function
 * @param {Beam} beam Beam object
 * @param {Number} load Load
 * @returns {FnEquation} Bending moment equation
 */

/**
 * @callback FnGetDeflectionEquation Get deflection equation function
 * @param {Beam} beam Beam object
 * @param {Number} load Load
 * @returns {FnEquation} Deflection equation
 */

/**
 * @typedef {Object} BeamAnalyzer Beam analyzer object
 * @property {FnGetDeflectionEquation} getDeflectionEquation   Get deflection equation
 * @property {FnGetBendingMomentEquation} getBendingMomentEquation Get bending moment equation
 * @property {FnGetShearForceEquation} getShearForceEquation    Get shear force equation
 */

class BeamAnalysis {
  constructor() {
    /**
     * @typedef {Object} BeamAnalysisOptions Beam analysis options
     * @property {AnalysisCondition} condition Beam analysis condition
     */

    /**
     * @type {BeamAnalysisOptions} Beam analysis options
     * @private
     */
    this.options = {
      condition: 'simply-supported',
    };

    /**
     * @type {Record<AnalysisCondition, BeamAnalyzer>} Beam analysis analyzers
     * @public
     */
    this.analyzer = {
      'simply-supported': new BeamAnalysis.analyzer.simplySupported(),
      'two-span-unequal': new BeamAnalysis.analyzer.twoSpanUnequal(),
    };
  }

  /**
   *
   * @param {Beam} beam
   * @param {Number} load
   * @param {AnalysisCondition} condition
   */
  getDeflection(beam, load, condition) {
    var analyzer = this.analyzer[condition];

    if (analyzer) {
      return {
        condition,
        beam: beam,
        load: load,
        equation: analyzer.getDeflectionEquation(beam, load),
      };
    } else {
      throw new Error('Invalid condition');
    }
  }

  /**
   *
   * @param {Beam} beam
   * @param {Number} load
   * @param {AnalysisCondition} condition
   */
  getBendingMoment(beam, load, condition) {
    var analyzer = this.analyzer[condition];

    if (analyzer) {
      return {
        condition,
        beam: beam,
        load: load,
        equation: analyzer.getBendingMomentEquation(beam, load),
      };
    } else {
      throw new Error('Invalid condition');
    }
  }

  /**
   *
   * @param {Beam} beam
   * @param {Number} load
   * @param {AnalysisCondition} condition
   */
  getShearForce(beam, load, condition) {
    var analyzer = this.analyzer[condition];

    if (analyzer) {
      return {
        condition,
        beam: beam,
        load: load,
        equation: analyzer.getShearForceEquation(beam, load),
      };
    } else {
      throw new Error('Invalid condition');
    }
  }
}

/** ============================ Beam Analysis Analyzer ============================ */

/**
 * Available analyzers for different conditions
 */
BeamAnalysis.analyzer = {};

/**
 * Calculate deflection, bending stress and shear stress for a simply supported beam
 */
BeamAnalysis.analyzer.simplySupported = class {
  constructor(beam, load) {
    /**
     * @type {Beam} The beam object
     * @public
     */
    this.beam = beam;

    /**
     * @type {Number} The applied load
     * @public
     */
    this.load = load;
  }

  /**
   * @type {FnGetDeflectionEquation}
   */
  getDeflectionEquation(beam, load) {
    // formula: -1 * ((w * x) / (24 * EI)) * (L^3 - 2*L * x^2 + x^3) * j2 * 1000

    const { EI, j2 } = beam.material.properties;

    const eiInKilos = EI / Math.pow(1000, 3);

    return function (x) {
      if (x > beam.primarySpan || x < 0) {
        throw new Error('Invalid x value');
      }

      const xSquared = Math.pow(x, 2);
      const xCubed = Math.pow(x, 3);
      const lengthCubed = Math.pow(beam.primarySpan, 3);

      const deflection =
        -1 *
        ((load * x) / (24 * eiInKilos)) *
        (lengthCubed - 2 * beam.primarySpan * xSquared + xCubed) *
        j2 *
        1000;

      return {
        x: x,
        y: deflection,
      };
    };
  }

  /**
   * @type {FnGetBendingMomentEquation}
   */
  getBendingMomentEquation(beam, load) {
    // formula: ((w * x / 2) * (L - x)) * -1

    return function (x) {
      if (x > beam.primarySpan || x < 0) {
        throw new Error('Invalid x value');
      }

      const bendingMoment = ((load * x) / 2) * (beam.primarySpan - x) * -1;

      return {
        x: x,
        y: bendingMoment,
      };
    };
  }

  /**
   * @type {FnGetShearForceEquation}
   */
  getShearForceEquation(beam, load) {
    // formula: w * ((L / 2) - x)
    // where w = load, L = span length, x = distance from left support
    // stop when x === L, which basically means reach all the way to the right end

    return function (x) {
      if (x > beam.primarySpan || x < 0) {
        throw new Error('Invalid x value');
      }

      const shearForce = load * (beam.primarySpan / 2 - x);

      return {
        x: x,
        y: shearForce,
      };
    };
  }
};

/**
 * Calculate deflection, bending stress and shear stress for a beam with two spans of equal condition
 */
BeamAnalysis.analyzer.twoSpanUnequal = class {
  constructor(beam, load) {
    /**
     * @type {Beam} The beam object
     * @public
     */
    this.beam = beam;

    /**
     * @type {Number} The applied load
     * @public
     */
    this.load = load;
  }

  /**
   * @type {FnGetDeflectionEquation}
   */
  getDeflectionEquation(beam, load) {
    return function (x) {
      return {
        x: x,
        y: null,
      };
    };
  }

  /**
   * @type {FnGetBendingMomentEquation}
   */
  getBendingMomentEquation(beam, load) {
    return function (x) {
      return {
        x: x,
        y: null,
      };
    };
  }

  /**
   * @type {FnGetShearForceEquation}
   */
  getShearForceEquation(beam, load) {
    return function (x) {
      return {
        x: x,
        y: null,
      };
    };
  }
};
