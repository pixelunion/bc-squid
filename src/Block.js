/**
 * A layout block.
 *
 * Holds an item's natural size, and layout size.
 *
 * The natural size is calculated by the `getSize` function, and represents the
 * size it naturally takes up.
 *
 * The layout size starts as the natural size, but is then adjusted to make the
 * item fit in the grid.
 */
export default class Block {
  constructor(object, naturalSize, gravity, resistance) {
    this.object = object;

    this.naturalSize = naturalSize;
    this.size = Object.assign({}, this.naturalSize);
    this.gravity = gravity;
    this.resistance = resistance;
  }

  updateSizeForWidth(width) {
    // Don't touch the height
    // if (this.resistance === 1) {
      // this.size = { width, height: this.naturalSize.height };
    // }

    // Resize height based on new width
    // else {
      const ratio = width / this.naturalSize.width;
      const height = Math.floor(this.naturalSize.height * ratio);
      this.size = { width, height };
      console.log(width, ratio, height);
    // }
  }
}
