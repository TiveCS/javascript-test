'use strict';

/**
 * @typedef {Object} Position Position object structure
 * @property {Number} x X coordinate in pixel
 * @property {Number} y Y coordinate in pixel
 */

/**
 * @typedef {Object} Size Size object structure
 * @property {Number} width width in pixel
 * @property {Number} height height in pixel
 */

/**
 * @typedef {Object} Layup Layup object structure
 * @property {String} label Layup label
 * @property {Number} thickness Layup thickness in mm
 * @property {Number} angle Layup angle in degrees
 * @property {String} grade Layup grade
 */

/**
 * @typedef {Record<string, Layup>} LayupList List record of Layup object
 */

function LayupDrawer() {
  /**
   * Canvas element
   *
   * @type {HTMLCanvasElement} Canvas element
   */
  this.canvas = null;

  /**
   * @type {HTMLImageElement} Paralel grain image
   */
  this.paralelGrainImg = new Image();

  /**
   * @type {HTMLImageElement} Perpendicular grain image
   */
  this.perpendicularGrainImg = new Image();

  /**
   * @type {Number} Pixel per mm
   */
  this.pixelPerMm = 2.5;

  /**
   * @type {Position} Initial position
   */
  this.initialPos = { x: 40, y: 20 };

  /**
   * @type {Position} Zero point position
   */
  this.zeroPointPos = null;

  /**
   * @type {Position} Edge position
   */
  this.edgePosition = null;
}

LayupDrawer.prototype = {
  /**
   * Configure the canvas
   *
   * @param {HTMLCanvasElement} canvas  Canvas element
   */
  init: function (canvas) {
    this.canvas = canvas;
    this.paralelGrainImg.src = 'images/paralel-grain-0.jpg';
    this.perpendicularGrainImg.src = 'images/perpendicular-grain-90.jpg';
  },

  /**
   * Draw a layup configuration on the canvas
   *
   * @param {LayupList} layupList Layup object structure
   * @param {Number} length Layup length in mm
   */
  drawLayup: function (layupList, length) {
    const ctx = this.canvas.getContext('2d');

    ctx.font = '12px Arial';
    ctx.fillStyle = 'gray';
    ctx.strokeStyle = 'gray';

    const layupHeight = 180;
    const layupWidth = 180;

    this.drawParalelGrainImg({
      ctx,
      size: {
        width: this.toPixel(layupWidth - 45),
        height: this.toPixel(layupHeight),
      },
    });

    this.edgePosition = this.drawChartLine({
      ctx,
      xLength: layupWidth,
      yLength: layupHeight,
    });

    this.zeroPointPos = {
      x: this.initialPos.x,
      y: this.initialPos.y + this.edgePosition.y - 20,
    };

    this.drawChartRulerLines({
      ctx,
      xLength: layupWidth,
      yLength: layupHeight,
      xInterval: 6,
      yInterval: 12,
    });

    this.drawPerpendicularGrainImg({
      ctx,
      position: { x: this.initialPos.x, y: this.initialPos.y },
      size: {
        width: this.toPixel(60),
        height: this.toPixel(45),
      },
    });
    this.drawPerpendicularGrainImg({
      ctx,
      position: {
        x: this.initialPos.x + this.toPixel(60),
        y: this.initialPos.y,
      },
      size: {
        width: this.toPixel(60),
        height: this.toPixel(45),
      },
    });
    this.drawPerpendicularGrainImg({
      ctx,
      position: {
        x: this.initialPos.x + this.toPixel(120),
        y: this.initialPos.y,
      },
      size: {
        width: this.toPixel(60),
        height: this.toPixel(45),
      },
    });
    this.drawPerpendicularGrainImg({
      ctx,
      position: {
        x: this.initialPos.x + this.toPixel(180),
        y: this.initialPos.y,
      },
      size: {
        width: this.toPixel(60),
        height: this.toPixel(45),
      },
    });

    Object.entries(layupList).forEach(([key, layup]) => {});
  },

  /**
   * Convert millimeter to pixel
   *
   * @param {Number} mm Millimeter value
   * @returns {Number} Pixel value
   */
  toPixel: function (mm) {
    return mm * this.pixelPerMm;
  },

  /**
   * Convert pixel to millimeter
   * @param {Number} pixel Pixel value
   * @returns {Number} Millimeter value
   */
  toMilimeter: function (pixel) {
    return pixel / this.pixelPerMm;
  },

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  moveToInitialPoint: function (ctx) {
    ctx.moveTo(this.initialPos.x, this.initialPos.y);
  },

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  moveToZeroPoint: function (ctx) {
    ctx.moveTo(this.zeroPointPos.x, this.zeroPointPos.y);
  },

  /**
   * Draw layup chart line on canvas
   *
   * @typedef {Object} DrawChartLineArgs DrawChartLine arguments
   * @property {CanvasRenderingContext2D} ctx Canvas's 2D context
   * @property {Number} xLength X length coordinate in mm
   * @property {Number} yLength Y length coordinate in mm
   *
   * @param {DrawChartLineArgs} args DrawChartLine arguments
   * @returns {Position} chart line edge position
   */
  drawChartLine: function ({ ctx, xLength, yLength }) {
    // y: 12mm per line, 5 line = 60mm
    // x: 6mm per line, 5 line = 30mm

    const x = this.toPixel(xLength);
    const y = this.toPixel(yLength);

    ctx.beginPath();

    this.moveToInitialPoint(ctx);

    ctx.lineTo(this.initialPos.x, this.initialPos.y + y);

    ctx.lineTo(this.initialPos.x + x, this.initialPos.y + y);

    ctx.stroke();

    ctx.closePath();

    return { x: this.initialPos.x + x, y: this.initialPos.y + y };
  },

  /**
   *
   * @param {CanvasRenderingContext2D} ctx Canvas's 2D context
   * @param {Number} x x position in pixel from zero point
   * @param {Number} y y position in pixel from zero point
   * @param {'x' | 'y'} dir ruler line for x or y
   * @param {string?} label label of the ruler line
   */
  drawRulerLine(ctx, x, y, dir, label) {
    /**
     * @type {Position} position
     */
    ctx.beginPath();
    const position = { x: this.zeroPointPos.x + x, y: this.zeroPointPos.y + y };

    ctx.moveTo(position.x, position.y);

    const lineLength = 15;
    const labelOffset = 20;

    if (dir === 'x') position.y += lineLength;

    if (dir === 'y') position.x -= lineLength;

    ctx.lineTo(position.x, position.y);
    ctx.stroke();

    ctx.closePath();

    if (!label) return;

    if (dir === 'x') position.y += labelOffset;

    if (dir === 'y') position.x -= labelOffset;

    ctx.save();

    ctx.fillText(label, position.x, position.y);

    ctx.restore();
  },

  /**
   * Draw chart ruler line on canvas
   *
   * @typedef {Object} DrawChartRulerLineArgs DrawChartRulerLine arguments
   * @property {CanvasRenderingContext2D} ctx Canvas's 2D context
   * @property {Number} xLength X length coordinate in mm
   * @property {Number} yLength Y length coordinate in mm
   * @property {Number} xInterval X interval in mm
   * @property {Number} yInterval Y interval in mm
   *
   * @param {DrawChartRulerLineArgs} args DrawChartRulerLine arguments
   */
  drawChartRulerLines: function ({
    ctx,
    xLength,
    yLength,
    xInterval,
    yInterval,
  }) {
    for (let x = 0; x * xInterval < xLength; x++) {
      const xPixel = this.toPixel(x * xInterval);
      this.drawRulerLine(
        ctx,
        xPixel,
        0,
        'x',
        x % 5 === 0 ? (x * xInterval).toString() : ''
      );
    }

    for (let y = 0; y * yInterval < yLength; y++) {
      const yPixel = this.toPixel(y * yInterval);
      this.drawRulerLine(
        ctx,
        0,
        -yPixel,
        'y',
        y % 5 === 0 ? (y * yInterval).toString() : ''
      );
    }
  },

  /**
   * Draw paralel-grain-9.jpg image on canvas
   *
   * @typedef {Object} DrawParalelGrainImgArgs DrawParalelGrainImg arguments
   * @property {CanvasRenderingContext2D} ctx Canvas's 2D context
   * @property {Size} size Image size object
   *
   * @param {DrawParalelGrainImgArgs} args DrawParalelGrainImg arguments
   */
  drawParalelGrainImg: function ({ ctx, size }) {
    ctx.drawImage(
      this.paralelGrainImg,
      this.initialPos.x,
      this.initialPos.y,
      size.width,
      size.height
    );
  },

  /**
   * Draw perpendicular-grain-90.jpg image on canvas
   *
   * @typedef {Object} DrawPerpendicularGrainImgArgs DrawPerpendicularGrainImg arguments
   * @property {CanvasRenderingContext2D} ctx Canvas's 2D context
   * @property {Size} size Image size object
   * @property {Position} position Image position
   *
   * @param {DrawPerpendicularGrainImgArgs} args DrawPerpendicularGrainImg arguments
   */
  drawPerpendicularGrainImg: function ({ ctx, position, size }) {
    // actual image size (width x height): 1500 x 500

    const topPortion = 3 / 10;
    const bottomPortion = 7 / 10;

    ctx.drawImage(
      this.perpendicularGrainImg,
      0,
      0,
      1500,
      300,
      position.x,
      position.y,
      size.width,
      size.height * topPortion
    );
    ctx.drawImage(
      this.perpendicularGrainImg,
      0,
      0,
      1500,
      300,
      position.x,
      position.y + size.height * topPortion,
      size.width,
      size.height - size.height * bottomPortion
    );
  },

  /**
   * @typedef {Object} DrawPerpendicularGrainRowArgs DrawPerpendicularGrainRow arguments
   * @property {CanvasRenderingContext2D} ctx Canvas's 2D context
   * @property {Position} position Row start position
   * @property {Size} size Size each image block
   *
   * @param {DrawPerpendicularGrainRowArgs} args DrawPerpendicularGrainRow arguments
   */
  drawPerpendicularGrainRow: function ({ ctx, position, size }) {
    this.drawPerpendicularGrainImg({ ctx, size, position: {} });
  },
};
