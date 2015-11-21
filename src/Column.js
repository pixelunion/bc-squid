/**
 * A grid column.
 *
 * Keeps track of any Blocks assigned to the column, and compresses them to fit.
 */
export default class Column {
  constructor(gutter) {
    this._gutter = gutter;

    this.blocksHeight = 0;
    this.guttersHeight = 0;

    this.left = 0;
    this.width = 0;
    this.height = 0;
    this.blocks = [];
  }

  get naturalHeight() {
    return this.blocksHeight + this.guttersHeight;
  }

  add(block) {
    this.blocks.push(block);
    this.blocksHeight += block.naturalSize.height;

    if (this.blocks.length > 1) {
      this.guttersHeight += this._gutter;
    }
  }

  /**
   * Resize blocks to fit the column width, and stack them.
   */
  positionBlocks() {
    let top = 0;

    for (let block of this.blocks) {
      block.updateSizeForWidth(this.width);
      block.top = top;
      block.left = this.left;
      top += block.size.height + this._gutter;
    }

    this.height = top;
  }

  /**
   * Compress blocks so that this column matches a target height.
   *
   * TODO: Broken in the case where an adjustment makes a block's size less than
   * zero.
   */
  compress(targetHeight) {
    const change = targetHeight - this.height;

    // Approximate the adjustment for each column
    const guess = Math.floor(change / this.blocks.length);

    // The number of pixels that couldn't be divided evenly
    let remainder = change - (guess * this.blocks.length);

    // Make adjustments
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      let adjustment = guess + (i < remainder ? 1 : 0);

      this.blocks[i].size.height += adjustment;
      this.height += adjustment;
    }

    // Update block positions
    let top = 0;

    for (let block of this.blocks) {
      block.top = top;
      top += block.size.height + this._gutter;
    }
  }
}
