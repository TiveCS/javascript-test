'use strict';

/**
 * @typedef {Object} Position Position object structure
 * @property {Number} x X coordinate in pixel
 * @property {Number} y Y coordinate in pixel
 */

/**
 * @typedef {Object} Size Size object structure
 * @property {Number} width width in mm
 * @property {Number} height height in mm
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
   * @type {CanvasRenderingContext2D} Canvas context
   */
  this.ctx = null;

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
   * @type {Position} Initial position in pixel
   */
  this.initialPos = { x: 40, y: 20 };
}

LayupDrawer.prototype = {
  /**
   * Configure the canvas
   *
   * @param {HTMLCanvasElement} canvas  Canvas element
   */
  init: function (canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
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
    const grainWidth = 240;
    const grainHeight = 150;

    this.drawGrainRegion({ size: { width: grainWidth, height: grainHeight } });

    this.drawGrainBackground({
      size: { width: grainWidth, height: grainHeight },
    });
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
   * @typedef {Object} DrawGrainRegionArgs Grain region drawing arguments
   * @property {Size} size Grain region size
   *
   * @param {DrawGrainRegionArgs} args Drawing arguments
   */
  drawGrainRegion: function ({ size }) {
    this.ctx.beginPath();

    const box = new Path2D();
    box.rect(
      this.initialPos.x,
      this.initialPos.y,
      this.toPixel(size.width),
      this.toPixel(size.height)
    );

    this.ctx.clip(box, 'evenodd');

    this.ctx.closePath();
  },

  /**
   * Draw grain background
   *
   * @typedef {Object} DrawGrainBackgroundArgs Grain background drawing arguments
   * @property {Size} size Grain background size in mm
   *
   * @param {DrawGrainBackgroundArgs} args Drawing arguments
   */
  drawGrainBackground: function ({ size }) {
    this.ctx.beginPath();

    // actual image size is 500x500
    this.ctx.drawImage(
      this.paralelGrainImg,
      0,
      0,
      500,
      500,
      this.initialPos.x,
      this.initialPos.y,
      this.toPixel(size.width),
      this.toPixel(size.height)
    );

    this.ctx.closePath();
  },

  /**
   * Draw grain pattern
   *
   * @typedef {Object} DrawGrainPatternBLockArgs Grain pattern drawing arguments
   * @property {Size} size Grain pattern size in mm
   * @property {Position} position Grain pattern position in mm
   *
   * @param {DrawGrainPatternBLockArgs} args Drawing arguments
   *
   */
  drawGrainPatternBlock: function ({ position, size }) {},

  /**
   *
   * @typedef {Object} DrawGrainPatternRowArgs Grain pattern row drawing arguments
   * @property {Position} position Grain pattern row position in mm
   * @property {Number} blockCount Number of blocks in the row
   *
   * @param {DrawGrainPatternRowArgs} args Drawing arguments
   */
  drawGrainPatternRow: function ({ position, blockCount }) {},

  /**
   * Draw layup ruler
   *
   * @typedef {Object} DrawRulerArgs Ruler drawing arguments
   * @property {Size} size Ruler size in mm
   */
  drawRuler: function () {},
};
