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
  this.initialPos = { x: 100, y: 60 };
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

    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = 'gray';
    this.ctx.strokeStyle = 'gray';
  },

  /**
   * Draw a layup configuration on the canvas
   *
   * @param {LayupList} layupList Layup object structure
   * @param {Number} length Layup length in mm
   */
  drawLayup: function (layupList, length) {
    const grainWidth = 200;
    const grainHeight = 150;

    this.drawRuler({
      position: { x: this.initialPos.x, y: this.initialPos.y },
      size: { width: grainWidth + 40, height: grainHeight },
      stepCount: 5,
      stepGap: 20,
      stepLength: 5,
    });

    this.drawLegends({ size: { width: grainWidth, height: grainHeight } });

    this.ctx.save();

    this.drawGrainRegion({ size: { width: grainWidth, height: grainHeight } });

    this.drawGrainBackground({
      size: { width: grainWidth, height: grainHeight },
    });

    this.drawLayupRows({
      layupList,
      position: this.initialPos,
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

    this.ctx.beginPath();

    this.ctx.strokeStyle = 'lime';
    this.ctx.moveTo(position.x, position.y);
    this.ctx.lineTo(
      position.x + this.toPixel(blockSize.width) * blockCount,
      position.y
    );

    this.ctx.stroke();

    this.ctx.moveTo(position.x, position.y + this.toPixel(blockSize.height));

    this.ctx.lineTo(
      position.x + this.toPixel(blockSize.width) * blockCount,
      position.y + this.toPixel(blockSize.height)
    );

    this.ctx.stroke();

    this.ctx.closePath();
  },

  /**
   * @typedef {Object} DrawLayupRowsArgs Layup rows drawing arguments
   * @property {LayupList} layupList Layup list
   * @property {Size} size Layup size in mm
   * @property {Position} position Layup position in pixel
   *
   * @param {DrawLayupRowsArgs} args Drawing arguments
   */
  drawLayupRows: function ({ layupList, position, size }) {
    const layupKeys = Object.keys(layupList);

    layupKeys.forEach((_, index) => {
      const yDelta = index * (this.toPixel(size.height) / layupKeys.length);

      if (index % 2 === 0) return;

      this.drawGrainPatternRow({
        blockCount: 5,
        blockSize: { width: 60, height: 30 },
        position: {
          x: position.x - 70,
          y: position.y + yDelta,
        },
      });
    });

    this.ctx.restore();

    layupKeys.forEach((key, index) => {
      const layup = layupList[key];
      const yDelta =
        index * (this.toPixel(size.height) / layupKeys.length) + 30;

      this.drawText({
        text: `${layup.label}: ${layup.thickness}mm ${layup.grade}`,
        radian: 0,
        position: {
          x: position.x + this.toPixel(size.width) + 75,
          y: position.y + yDelta,
        },
      });
    });

    this.ctx.beginPath();

    this.ctx.moveTo(this.initialPos.x, this.initialPos.y);

    this.ctx.lineTo(
      this.initialPos.x + this.toPixel(size.width),
      this.initialPos.y
    );

    this.ctx.strokeStyle = 'lime';
    this.ctx.stroke();

    this.ctx.moveTo(
      this.initialPos.x,
      this.initialPos.y + this.toPixel(size.height)
    );

    this.ctx.lineTo(
      this.initialPos.x + this.toPixel(size.width),
      this.initialPos.y + this.toPixel(size.height)
    );

    this.ctx.stroke();

    this.ctx.closePath();
  },

  /**
   * @typedef {Object} DrawTextArgs Text drawing arguments
   * @property {String} text Text to draw
   * @property {Position} position Text position in pixel
   * @property {Number} radian Text angle in radian
   *
   * @param {DrawTextArgs} args Drawing arguments
   */
  drawText: function ({ text, radian, position }) {
    this.ctx.save();

    this.ctx.translate(position.x, position.y);

    this.ctx.rotate(radian);

    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, 0, 0);

    this.ctx.restore();
  },

  /**
   * @typedef {Object} DrawRulerStepLineArgs Ruler step line drawing arguments
   * @property {Number} length Step line length in pixel
   * @property {'x' | 'y'} dir Direction of the step line
   * @property {string?} label Step line label
   * @property {Position} position Initial step line position in pixel
   * @property {Number} labelOffset Label offset in pixel
   *
   * @param {DrawRulerStepLineArgs} args Drawing arguments
   */
  drawRulerStepLine: function ({
    length,
    dir,
    label = null,
    position,
    labelOffset = 20,
  }) {
    this.ctx.beginPath();

    this.ctx.moveTo(position.x, position.y);

    this.ctx.lineTo(position.x, position.y);

    if (dir === 'x') {
      this.ctx.lineTo(position.x, position.y + length);
    }

    if (dir === 'y') {
      this.ctx.lineTo(position.x - length, position.y);
    }

    this.ctx.stroke();

    if (!label) {
      this.ctx.closePath();
      return;
    }

    if (dir === 'x') {
      this.drawText({
        text: label,
        position: { x: position.x, y: position.y + length + labelOffset },
        radian: -Math.PI / 4,
      });
    }

    if (dir === 'y') {
      this.ctx.fillText(label, position.x - length - labelOffset, position.y);
    }

    this.ctx.closePath();
  },

  /**
   * Draw layup ruler
   *
   * @typedef {Object} DrawRulerArgs Ruler drawing arguments
   * @property {Size} size Ruler size in mm
   * @property {Position} position Ruler position in pixel
   * @property {Number} stepGap Step gap in pixel
   * @property {Number} stepCount Step count before the next labeled step
   * @property {Number} stepLength Each step's length in pixel
   *
   * @param {DrawRulerArgs} args Drawing arguments
   */
  drawRuler: function ({ size, position, stepCount = 5, stepLength, stepGap }) {
    this.ctx.beginPath();

    this.ctx.moveTo(position.x, position.y);

    this.ctx.lineTo(position.x, position.y + this.toPixel(size.height));

    this.ctx.lineTo(
      position.x + this.toPixel(size.width),
      position.y + this.toPixel(size.height)
    );

    this.ctx.stroke();

    this.ctx.closePath();

    // Draw ruler for x axis
    for (let i = 0; i * stepGap < this.toPixel(size.width); i++) {
      const hasLabel =
        i % stepCount === 0 && i * stepGap < this.toPixel(size.width);

      this.drawRulerStepLine({
        label: hasLabel ? `${i * 6}` : null,
        length: this.toPixel(stepLength),
        dir: 'x',
        position: {
          x: position.x + i * stepGap,
          y: position.y + this.toPixel(size.height),
        },
      });
    }

    // Draw ruler for y axis
    for (let i = 0; i * stepGap < this.toPixel(size.height); i++) {
      const hasLabel = i % stepCount === 0;

      this.drawRulerStepLine({
        label: hasLabel ? `${i * 12}` : null,
        length: this.toPixel(stepLength),
        dir: 'y',
        position: {
          x: position.x,
          y: position.y + this.toPixel(size.height) - i * stepGap,
        },
      });
    }
  },

  /**
   * @typedef {Object} DrawLegendsArgs Legend drawing arguments
   * @property {Size} size Size of layup in mm
   *
   * @param {DrawLegendsArgs} args
   */
  drawLegends: function ({ size }) {
    this.drawText({
      text: 'Primary Direction',
      radian: 0,
      position: {
        x: this.initialPos.x + this.toPixel(size.width) / 2,
        y: this.initialPos.y + this.toPixel(size.height) + 80,
      },
    });

    this.drawText({
      text: 'Slab Thickness (mm)',
      radian: -Math.PI / 2,
      position: {
        x: this.initialPos.x - 60,
        y: this.initialPos.y + this.toPixel(size.height) / 2,
      },
    });
  },
};
