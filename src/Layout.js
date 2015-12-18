import Block from './Block';
import Column from './Column';

/**
 * The main layout algorithm.
 *
 * Takes an array of items, and returns an array of layout objects.
 *
 * @param items Array
 *        An array of items to lay-out. Their sizes are calculated with the
 *        `getSize` option.
 *
 * @param width Number
 *        The width of the grid, in pixels.
 *
 * @param options Object
 *
 *        columns Number
 *        The number of columns in the layout.
 *
 *        gutter Number
 *        The gutter size. If between 0 and 1, the size will be used as a
 *        percentage. Otherwise in pixels.
 *
 *        getSize Function
 *        A function to calculate the size of an item. Expects an object with
 *        `width` and `height` properties.
 *
 *        getGravity Function
 *        A function to calculate the "gravity" of an item. This affects the
 *        position items are inserted into a column. Items with a lower gravity
 *        are placed above items with a higher gravity. Expects a number between
 *        -1 and 1.
 *
 *        getResistance Function
 *        A function to calculate the "resistance" of an item. Items with a
 *        higher resistance will be compressed less when trying to resize a
 *        column. Expects a number between 0 and 1.
 *
 * @return array
 *         Layout objects contain the following properties:
 *
 *         top Number: The item's top position.
 *         left Number: The item's left position.
 *         width Number: The item's width.
 *         height Number: The item's height.
 *         object Object: The original item.
 */
export default function layout(items, width, options) {
  if (typeof options.columns !== 'number' || options.columns < 0) {
    throw new Error('Missing option: `columns` number of columns for grid.');
  }

  if (typeof options.gutter !== 'number' || options.gutter < 0) {
    throw new Error('Missing option: `gutter` grid gutter size in pixels.');
  }

  if (typeof options.getSize !== 'function') {
    throw new Error('Missing option: `getSize` function to calculate size of a grid item.');
  }

  if (typeof options.getGravity !== 'function') {
    throw new Error('Missing option: `getGravity` function to calculate size of a grid item.');
  }

  if (typeof options.getResistance !== 'function') {
    throw new Error('Missing option: `getResistance` function to calculate size of a grid item.');
  }

  if (typeof width !== 'number' || width < 0) {
    throw new Error('Missing option: `width` pixel width of the grid.');
  }

  // Normalize gutter
  const gutter = options.gutter > 0 && options.gutter < 1
    ? Math.floor(width * options.gutter)
    : options.gutter;

  // Fast quit
  if (!items || !items.length) {
    return [];
  }

  // Initialize columns
  const columns = [];

  for (let i = 0; i < options.columns; i++) {
    columns.push(new Column(gutter));
  }

  // Initialize blocks
  const blocks = [];

  for (let item of items) {
    const size = options.getSize(item);
    const gravity = options.getGravity(item);
    const resistance = options.getResistance(item);
    blocks.push(new Block(item, size, gravity, resistance));
  }

  // Insert blocks into columns
  for (let block of blocks) {
    shortestColumnInserter(columns, block);
  }

  // Set column widths
  setColumnWidths(columns, width, gutter);

  // Set column positions
  setColumnPositions(columns, gutter);

  // Set initial item positions
  for (let column of columns) {
    column.positionBlocks();
  }

  // Get target height
  const target = midrangeEqualizer(columns);

  // Compress columns
  for (let column of columns) {
    column.compress(target);
  }

  // Handle uncompressible columns
  const tallest = columns.reduce((a, b) => {
    return a.height > b.height ? a : b;
  }, columns[0]);

  // Compress columns
  for (let column of columns) {
    column.compress(tallest.height);
  }

  // Output
  const output = [];

  for (let column of columns) {
    for (let block of column.blocks) {
      output.push({
        object: block.object,

        top: block.top,
        left: block.left,
        width: block.size.width,
        height: block.size.height,
      });
    }
  }

  return output;
}

/**
 * Calculate the width of each column, ensuring whole numbers.
 *
 * If we have a 100px wide grid, with 3 columns, and no gutters:
 *
 *   width = 100 / 3 = 33.333px
 *
 * We adjust the columns so that they have widths of: 34px, 33px, 33px.
 */
function setColumnWidths(columns, width, gutter) {
  const count = columns.length;

  // Size of all gutters needed for the grid
  const gutters = Math.max(0, count - 1) * gutter;

  // Approximate the size for each column
  const guess = Math.floor((width - gutters) / count);

  // The number of pixels that couldn't be divided evenly
  const remainder = width - (guess * count) - gutters;

  // Set widths
  for (let i = 0; i < columns.length; i++) {
    columns[i].width = guess + (i < remainder ? 1 : 0);
  }
}

/**
 * Calculate the left position for a column, taking into account gutters.
 */
function setColumnPositions(columns, gutter) {
  for (let i = 0; i < columns.length; i++) {
    const gutters = i * gutter;

    columns[i].left = columns
      .slice(0, i)
      .reduce((a, b) => a + b.width, gutters);
  }
}

/**
 * Insert a block into the shortest column.
 */
function shortestColumnInserter(columns, block) {
  const column = columns.reduce((a, b) => {
    return a.naturalHeight > b.naturalHeight ? b : a;
  }, columns[0]);

  column.add(block);
}

/**
 * Calculates a target column size. Takes an average of their heights.
 */
function averageEqualizer(columns) {
  const totalHeight = columns.reduce((a, b) => {
    return a + b.height;
  }, columns[0].height);

  return Math.floor(totalHeight / columns.length);
}

/**
 * Calculates a target column size. Subtracts the shortest from the tallest and
 * divides by 2.
 */
function midrangeEqualizer(columns) {
  const shortest = columns.reduce((a, b) => {
    return a.height < b.height || b.height === 0 ? a : b;
  }, columns[0]);

  const tallest = columns.reduce((a, b) => {
    return a.height > b.height ? a : b;
  }, columns[0]);

  return Math.floor((tallest.height + shortest.height) / 2);
}
