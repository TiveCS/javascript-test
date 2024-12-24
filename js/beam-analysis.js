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
 * @callback FnGetShearForceEquation Get shear force equation function
 * @param {Beam} beam Beam object
 * @param {Number} load Load
 * @returns {Function} Shear force equation
 */

/**
 * @callback FnGetBendingMomentEquation Get bending moment equation function
 * @param {Beam} beam Beam object
 * @param {Number} load Load
 */

/**
 * @callback FnGetDeflectionEquation Get deflection equation function
 * @param {Beam} beam Beam object
 * @param {Number} load Load
 * @returns {Function} Deflection equation
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
     * @public
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
