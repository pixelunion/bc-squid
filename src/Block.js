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
  constructor(object, naturalSize) {
    this.object = object;

    this.naturalSize = naturalSize;
    this.size = Object.assign({}, this.naturalSize);
  }

  updateSizeForWidth(width) {
    const ratio = width / this.naturalSize.width;
    const height = Math.floor(this.naturalSize.height * ratio);
    this.size = { width, height };
  }
}
