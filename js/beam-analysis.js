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
 * @param {Boolean?} isPrimarySpan Is the x value in the primary span side
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
    const totalLength = beam.primarySpan + beam.secondarySpan;
    const m1 = this.getM1(beam, load);
    const r1 = this.getR1(beam, load, m1);
    const r3 = this.getR3(beam, load, m1);
    const r2 = this.getR2(beam, load, r1, r3);

    const { EI, j2 } = beam.material.properties;

    // formula
    // x < L1: (x / (24 * (EI / 1000^3))) * (4 * R1 * x^2 - w * x^3 + w * L1^3 - 4 * R1 * L1^2) * 1000 * j2

    // x > L1:
    // [ ((R1 * x) / 6) * (x^2 - L1^2) + ((R2 * x) / 6) * (x^2 - (3 * L1 * x) + (3 * L1^2)) -  ((R2 * L1^3) / 6 - ((w * x) / 24) * (x^3 - L1^3))] * 1000 * j2
    // might split into 3 parts
    // part 1: ((R1 * x / 6) * (x^2 - L1^2))
    // part 2: ((R2 * x / 6) * (x^2 - 3 * L1 * x + 3 * L1^2))
    // part 3: ((R2 * L1^3 / 6)
    // part 4: ((w * x / 24) * (x^3 - L1^3))
    // formula: (p1 + p2 - p3 - p4) * 1 / (EI / 1000^3) * 1000 * j2

    const hundredCubed = Math.pow(1000, 3);

    const primarySpanSquared = Math.pow(beam.primarySpan, 2);
    const primarySpanCubed = Math.pow(beam.primarySpan, 3);

    return function (x) {
      if (x < 0 || x > totalLength) {
        throw new Error('Invalid x value. Must be between 0 and total length');
      }

      if (x === 0) return { x, y: 0 };

      const xSquared = Math.pow(x, 2);
      const xCubed = Math.pow(x, 3);

      if (x <= beam.primarySpan) {
        return {
          x,
          y:
            (x / (24 * (EI / hundredCubed))) *
            (4 * r1 * xSquared -
              load * xCubed +
              load * primarySpanCubed -
              4 * r1 * primarySpanSquared) *
            1000 *
            j2,
        };
      }

      if (x > beam.primarySpan) {
        const p1 = ((r1 * x) / 6) * (xSquared - primarySpanSquared);
        const p2 =
          ((r2 * x) / 6) *
          (xSquared - 3 * beam.primarySpan * x + 3 * primarySpanSquared);
        const p3 = (r2 * primarySpanCubed) / 6;
        const p4 = ((load * x) / 24) * (xCubed - primarySpanCubed);

        const result =
          (((p1 + p2 - p3 - p4) * 1) / (EI / hundredCubed)) * 1000 * j2;

        console.log({
          p1,
          p2,
          p3,
          p4,
          result,
        });

        return {
          x,
          y: result,
        };
      }

      throw new Error(`Invalid condition on x: ${x}`);
    };
  }

  /**
   * @type {FnGetBendingMomentEquation}
   */
  getBendingMomentEquation(beam, load) {
    /**
     * formula:
     * x = 0 or x = L, bending = 0
     *
     * (left span formula)
     * x < L1, -1 *(R1 * x - 0.5 * w * x^2)
     *
     * (right span formula)
     * x > L1, -((R1 * x + R2 * (x - L1)) - (0.5 * w * x^2)
     *
     * (transition point formula)
     * x = L1, -(R1 * L1 - (0.5 * w * L1^2)
     *
     */

    const totalLength = beam.primarySpan + beam.secondarySpan;
    const m1 = this.getM1(beam, load);
    const r1 = this.getR1(beam, load, m1);
    const r3 = this.getR3(beam, load, m1);
    const r2 = this.getR2(beam, load, r1, r3);

    const primarySpanSquared = Math.pow(beam.primarySpan, 2);

    return function (x, isPrimarySpan = false) {
      const xSquared = Math.pow(x, 2);

      if (x < 0 || x > totalLength) {
        throw new Error('Invalid x value. Must be between 0 and total length');
      }

      if (x === 0 || x === totalLength) return { x, y: 0 };

      // left span formula
      if (x < beam.primarySpan) {
        return { x, y: -1 * (r1 * x - load * xSquared * 0.5) };
      }

      // transition point
      if (x === beam.primarySpan) {
        return {
          x,
          y: -1 * (r1 * beam.primarySpan - 0.5 * (load * primarySpanSquared)),
        };
      }

      // right span formula
      if (x > beam.primarySpan) {
        return {
          x,
          y:
            -1 * (r1 * x + r2 * (x - beam.primarySpan) - 0.5 * load * xSquared),
        };
      }

      throw new Error(`Invalid condition on x: ${x}`);
    };
  }

  /**
   * @type {FnGetShearForceEquation}
   */
  getShearForceEquation(beam, load) {
    const totalLength = beam.primarySpan + beam.secondarySpan;

    const m1 = this.getM1(beam, load);
    const r1 = this.getR1(beam, load, m1);
    const r3 = this.getR3(beam, load, m1);
    const r2 = this.getR2(beam, load, r1, r3);

    return function (x, isPrimarySpan = false) {
      if (x < 0 || x > totalLength) {
        throw new Error('Invalid x value. Must be between 0 and total length');
      }

      if (x === 0) return { x, y: r1 };

      if (x === totalLength) return { x, y: r1 + r2 - load * totalLength };

      // use left span formula
      if (x > 0 && x < beam.primarySpan) {
        return { x, y: r1 - load * x };
      }

      // use right span formula
      if (x > beam.primarySpan && x < totalLength) {
        return { x, y: r1 + r2 - load * x };
      }

      // use approaching left span formula
      if (x === beam.primarySpan && isPrimarySpan) {
        return { x, y: r1 - load * beam.primarySpan };
      }

      // use approaching right span formula
      if (x === beam.primarySpan && !isPrimarySpan) {
        return { x, y: r1 + r2 - load * beam.primarySpan };
      }

      throw new Error(`Invalid condition on x: ${JSON.stringify(x)}`);
    };
  }

  /**
   *
   * @param {Beam} beam
   * @param {Number} load
   * @returns {Number}
   */
  getM1(beam, load) {
    // formula: M1 = -1 * ((w * L2^3) + (w * L1^3) / (8 * (L1 + L2)))
    // L1 + L2 = total length

    const primaryLengthCubed = Math.pow(beam.primarySpan, 3);
    const secondaryLengthCubed = Math.pow(beam.secondarySpan, 3);
    const totalLength = beam.primarySpan + beam.secondarySpan;

    return -(
      (load * secondaryLengthCubed + load * primaryLengthCubed) /
      (8 * totalLength)
    );
  }

  /**
   *
   * @param {Beam} beam beam object
   * @param {Number} load
   * @param {Number} m1 M1 value
   * @returns {Number}
   */
  getR1(beam, load, m1) {
    // R1 and R3 basically same formula, just different length point, which just replace L1 with L2

    return m1 / beam.primarySpan + (load * beam.primarySpan) / 2;
  }

  /**
   *
   * @param {Beam} beam beam object
   * @param {Number} load
   * @param {Number} m1 M1 value
   * @returns {Number}
   */
  getR3(beam, load, m1) {
    // R1 and R3 basically same formula, just different length point, which just replace L1 with L2

    return m1 / beam.secondarySpan + (load * beam.secondarySpan) / 2;
  }

  /**
   *
   * @param {Beam} beam beam object
   * @param {Number} load
   * @param {Number} r1 R1 value
   * @param {Numebr} r3 R3 value
   * @returns {Number}
   */
  getR2(beam, load, r1, r3) {
    // R2 formula: R2 = w * L1 + w * L2 - R1 - R3

    return load * beam.primarySpan + load * beam.secondarySpan - r1 - r3;
  }
};
