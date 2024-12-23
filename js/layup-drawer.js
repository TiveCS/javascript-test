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

    this.drawGrainPatternRow({
      blockCount: 5,
      position: {
        x: this.initialPos.x - 70,
        y: this.initialPos.y,
      },
      blockSize: { width: 60, height: 30 },
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
   * Create clip region
   *
   * @typedef {Object} CreateClipRegionArgs Clip region drawing arguments
   * @property {Size} size Clip region size in mm
   * @property {Position} position Clip region position
   *
   * @param {CreateClipRegionArgs} args Drawing arguments
   */
  createClipRegion: function ({ position, size }) {
    this.ctx.beginPath();

    const box = new Path2D();
    box.rect(
      position.x,
      position.y,
      this.toPixel(size.width),
      this.toPixel(size.height)
    );

    this.ctx.clip(box, 'evenodd');

    this.ctx.closePath();
  },

  /**
   * @typedef {Object} DrawGrainRegionArgs Grain region drawing arguments
   * @property {Size} size Grain region size
   *
   * @param {DrawGrainRegionArgs} args Drawing arguments
   */
  drawGrainRegion: function ({ size }) {
    this.createClipRegion({ position: this.initialPos, size });
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
  },

  /**
   * Draw grain pattern
   *
   * @typedef {Object} DrawGrainPatternBLockArgs Grain pattern drawing arguments
   * @property {Size} size Grain pattern size in mm
   * @property {Position} position Grain pattern position in pixel
   *
   * @param {DrawGrainPatternBLockArgs} args Drawing arguments
   *
   */
  drawGrainPatternBlock: function ({ position, size }) {
    // actual size is 1500x500

    const topPortion = 0.4;
    const bottomPortion = 0.6;

    this.ctx.drawImage(
      this.perpendicularGrainImg,
      0,
      0,
      1500,
      300,
      position.x,
      position.y,
      this.toPixel(size.width),
      this.toPixel(size.height) * topPortion
    );

    this.ctx.drawImage(
      this.perpendicularGrainImg,
      0,
      0,
      1500,
      500,
      position.x,
      position.y + this.toPixel(size.height) * topPortion,
      this.toPixel(size.width),
      this.toPixel(size.height) * bottomPortion
    );
  },

  /**
   * Draw multiple grain pattern blocks as a row
   *
   * @typedef {Object} DrawGrainPatternRowArgs Grain pattern row drawing arguments
   * @property {Position} position Grain pattern row position in mm
   * @property {Number} blockCount Number of blocks in the row
   * @property {Size} blockSize Size of each block in mm
   *
   * @param {DrawGrainPatternRowArgs} args Drawing arguments
   */
  drawGrainPatternRow: function ({ position, blockCount, blockSize }) {
    for (let i = 0; i < blockCount; i++) {
      this.drawGrainPatternBlock({
        size: blockSize,
        position: {
          x: position.x + i * this.toPixel(blockSize.width),
          y: position.y,
        },
      });
    }
  },

  /**
   * Draw layup ruler
   *
   * @typedef {Object} DrawRulerArgs Ruler drawing arguments
   * @property {Size} size Ruler size in mm
   *
   * @param {DrawRulerArgs} args Drawing arguments
   */
  drawRuler: function ({ size }) {},
};
