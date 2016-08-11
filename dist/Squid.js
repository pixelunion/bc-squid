'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var $ = _interopDefault(require('jquery'));

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

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
var Block = function () {
  function Block(object, naturalSize, gravity, resistance) {
    classCallCheck(this, Block);

    this.object = object;

    this.naturalSize = naturalSize;
    this.size = _extends({}, this.naturalSize);
    this.gravity = gravity;
    this.resistance = resistance;
  }

  createClass(Block, [{
    key: "updateSizeForWidth",
    value: function updateSizeForWidth(width) {
      // Don't touch the height
      if (this.resistance === 1) {
        this.size = { width: width, height: this.naturalSize.height };
      }

      // Resize height based on new width
      else {
          var ratio = width / this.naturalSize.width;
          var height = Math.floor(this.naturalSize.height * ratio);
          this.size = { width: width, height: height };
        }
    }
  }]);
  return Block;
}();

/**
 * A grid column.
 *
 * Keeps track of any Blocks assigned to the column, and compresses them to fit.
 */
var Column = function () {
  function Column(gutter) {
    classCallCheck(this, Column);

    this._gutter = gutter;

    this.blocksHeight = 0;
    this.guttersHeight = 0;

    this.left = 0;
    this.width = 0;
    this.height = 0;
    this.blocks = [];
  }

  createClass(Column, [{
    key: "add",
    value: function add(block) {
      // Add block to array, respecting its gravity position
      this.blocks.push(block);
      this.blocks.sort(function (a, b) {
        return a.gravity - b.gravity;
      });

      // Update cached column properties
      this.blocksHeight += block.naturalSize.height;

      if (this.blocks.length > 1) {
        this.guttersHeight += this._gutter;
      }
    }

    /**
     * Resize blocks to fit the column width, and stack them.
     */

  }, {
    key: "positionBlocks",
    value: function positionBlocks() {
      var _this = this;

      var top = 0;

      this.blocks.forEach(function (block) {
        block.updateSizeForWidth(_this.width);
        block.top = top;
        block.left = _this.left;
        top += block.size.height + _this._gutter;
      });

      this.height = top;
    }

    /**
     * Compress blocks so that this column matches a target height.
     *
     * TODO: Broken in the case where an adjustment makes a block's size less than
     * zero.
     */

  }, {
    key: "compress",
    value: function compress(targetHeight) {
      var _this2 = this;

      var blocks = this._compressibleBlocks();
      var change = targetHeight - this.height;

      // Approximate the adjustment for each column
      var guess = Math.floor(change / blocks.length);

      // The number of pixels that couldn't be divided evenly
      var remainder = change - guess * blocks.length;

      // Make adjustments
      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var adjustment = guess + (i < remainder ? 1 : 0);

        blocks[i].size.height += adjustment;
        this.height += adjustment;
      }

      // Update block positions
      var top = 0;

      this.blocks.forEach(function (block) {
        block.top = top;
        top += block.size.height + _this2._gutter;
      });
    }
  }, {
    key: "_compressibleBlocks",
    value: function _compressibleBlocks() {
      var blocks = [];

      for (var i = 0; i < this.blocks.length; i++) {
        var block = this.blocks[i];

        if (block.resistance !== 1) {
          blocks.push(block);
        }
      }

      return blocks;
    }
  }, {
    key: "naturalHeight",
    get: function get() {
      return this.blocksHeight + this.guttersHeight;
    }
  }]);
  return Column;
}();

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
function layout(items, width, options) {
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
  var gutter = options.gutter > 0 && options.gutter < 1 ? Math.floor(width * options.gutter) : options.gutter;

  // Fast quit
  if (!items || !items.length) {
    return [];
  }

  // Initialize columns
  var columns = [];

  for (var i = 0; i < options.columns; i++) {
    columns.push(new Column(gutter));
  }

  // Initialize blocks
  var blocks = [];

  items.forEach(function (item) {
    var visible = options.getVisibility(item);
    if (!visible) return;

    var size = options.getSize(item);
    var gravity = options.getGravity(item);
    var resistance = options.getResistance(item);
    blocks.push(new Block(item, size, gravity, resistance));
  });

  // Insert blocks into columns
  blocks.forEach(function (block) {
    return shortestColumnInserter(columns, block);
  });

  // Set column widths
  setColumnWidths(columns, width, gutter);

  // Set column positions
  setColumnPositions(columns, gutter);

  // Set initial item positions
  columns.forEach(function (column) {
    return column.positionBlocks();
  });

  // Get target height
  var target = midrangeEqualizer(columns);

  // Compress columns
  columns.forEach(function (column) {
    return column.compress(target);
  });

  // Handle uncompressible columns
  var tallest = columns.reduce(function (a, b) {
    return a.height > b.height ? a : b;
  }, columns[0]);

  // Compress columns
  columns.forEach(function (column) {
    return column.compress(tallest.height);
  });

  // Output
  var output = [];

  columns.forEach(function (column) {
    column.blocks.forEach(function (block) {
      output.push({
        object: block.object,
        top: block.top,
        left: block.left,
        width: block.size.width,
        height: block.size.height
      });
    });
  });

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
  var count = columns.length;

  // Size of all gutters needed for the grid
  var gutters = Math.max(0, count - 1) * gutter;

  // Approximate the size for each column
  var guess = Math.floor((width - gutters) / count);

  // The number of pixels that couldn't be divided evenly
  var remainder = width - guess * count - gutters;

  // Set widths
  for (var i = 0; i < columns.length; i++) {
    columns[i].width = guess + (i < remainder ? 1 : 0);
  }
}

/**
 * Calculate the left position for a column, taking into account gutters.
 */
function setColumnPositions(columns, gutter) {
  for (var i = 0; i < columns.length; i++) {
    var gutters = i * gutter;

    columns[i].left = columns.slice(0, i).reduce(function (a, b) {
      return a + b.width;
    }, gutters);
  }
}

/**
 * Insert a block into the shortest column.
 */
function shortestColumnInserter(columns, block) {
  var column = columns.reduce(function (a, b) {
    return a.naturalHeight > b.naturalHeight ? b : a;
  }, columns[0]);

  column.add(block);
}

/**
 * Calculates a target column size. Subtracts the shortest from the tallest and
 * divides by 2.
 */
function midrangeEqualizer(columns) {
  var shortest = columns.reduce(function (a, b) {
    return a.height < b.height || b.height === 0 ? a : b;
  }, columns[0]);

  var tallest = columns.reduce(function (a, b) {
    return a.height > b.height ? a : b;
  }, columns[0]);

  return Math.floor((tallest.height + shortest.height) / 2);
}

function defaultGetSize(item) {
  var img = $(item).find('img').get(0);
  if (!img) return undefined;

  return {
    width: img.naturalWidth,
    height: img.naturalHeight
  };
};

function defaultGetGravity(item) {
  return 0;
};

function defaultGetResistance(item) {
  return .5;
}

function defaultGetVisibility(item) {
  return $(item).is(':visible');
}

function defaultWrapper(name, implementation, defaultImplementation) {
  return function (item) {
    var value = implementation(item);

    if (value === undefined && implementation !== defaultImplementation) {
      value = defaultImplementation(item);
    }

    if (value === undefined) {
      throw new Error('Unable to get ' + name + ' of item.');
    }

    return value;
  };
};

/**
 * Layout items in a grid, with squared edges!
 */

var Squid = function () {
  function Squid($container, options) {
    classCallCheck(this, Squid);

    this.options = {
      columns: 2,
      gutter: 10,

      getSize: defaultGetSize,
      getGravity: defaultGetGravity,
      getResistance: defaultGetResistance,
      getVisibility: defaultGetVisibility,

      firstRenderClassname: 'squid-initialized',
      resizingClassname: 'squid-resizing'
    };

    // Elements
    this.$window = $(window);
    this.$container = $container;

    // State
    this.items = [];

    // Init
    this.update(options, false);

    if (this.options.resizingClassname) {
      this._initResizeHandler();
    }
  }

  createClass(Squid, [{
    key: '_initResizeHandler',
    value: function _initResizeHandler() {
      var _this = this;

      // Re-layout grid on window resize
      var timeout = null;

      this.$window.on('resize', function (event) {
        window.clearTimeout(timeout);
        _this.$container.addClass(_this.options.resizingClassname);

        _this.layout();

        timeout = window.setTimeout(function () {
          _this.$container.removeClass(_this.options.resizingClassname);
        }, 100);
      });
    }

    /**
     * Update options, and re-layout.
     *
     * Can be used to change any previously-supplied options, such as the number
     * of columns.
     *
     * @param options Object
     *        A set of options you want to update.
     *
     * @param layout Boolean (optional)
     *        If true, re-layout the grid after setting the options.
     */

  }, {
    key: 'update',
    value: function update(options) {
      var layout$$ = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      _extends(this.options, options);
      this._updateLayoutOptions();

      if (layout$$) {
        this.layout();
      }
    }

    /**
     * Add items to the grid.
     *
     * If the last argument is a number, previous arguments will be added at that
     * position.
     *
     * @param item...
     *        An item to add to the grid.
     */

  }, {
    key: 'add',
    value: function add() {
      var _items;

      for (var _len = arguments.length, items = Array(_len), _key = 0; _key < _len; _key++) {
        items[_key] = arguments[_key];
      }

      // Get insertion index
      var index = typeof items[items.length - 1] === 'number' ? items.pop() : this.items.length;

      (_items = this.items).splice.apply(_items, [index, 0].concat(items));
    }

    /**
     * Remove items from the grid.
     *
     * @param item...
     *        An item to remove from the grid.
     */

  }, {
    key: 'remove',
    value: function remove() {
      var _this2 = this;

      for (var _len2 = arguments.length, items = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        items[_key2] = arguments[_key2];
      }

      items.forEach(function (item) {
        var index = _this2.items.indexOf(item);

        if (index !== -1) {
          _this2.items.splice(index, 1);
        }
      });
    }

    /**
     * Remove all items from the grid.
     */

  }, {
    key: 'removeAll',
    value: function removeAll() {
      this.items = [];
    }

    /**
     * Re-render the grid.
     */

  }, {
    key: 'layout',
    value: function layout$$() {
      var height = 0;

      // Get layout blocks
      var blocks = layout(this.items, this.$container.width(), this.layoutOptions);

      // Position blocks
      blocks.forEach(function (block) {
        $(block.object).css({
          position: 'absolute',
          top: block.top,
          left: block.left,
          width: block.width,
          height: block.height
        });

        height = Math.max(height, block.top + block.height);
      });

      // Update container
      this.$container.css('height', height);
      this.$container.addClass(this.options.firstRenderClassname);
    }
  }, {
    key: '_updateLayoutOptions',
    value: function _updateLayoutOptions() {
      this.layoutOptions = {
        columns: this.options.columns,
        gutter: this.options.gutter,

        // Wrap the sizer functions to handle fallbacks
        getSize: defaultWrapper('size', this.options.getSize, defaultGetSize),
        getGravity: defaultWrapper('gravity', this.options.getGravity, defaultGetGravity),
        getResistance: defaultWrapper('resistance', this.options.getResistance, defaultGetResistance),
        getVisibility: defaultWrapper('visibility', this.options.getVisibility, defaultGetVisibility)
      };
    }
  }]);
  return Squid;
}();

module.exports = Squid;