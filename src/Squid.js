import $ from 'jquery';
import layout from './layout';

function defaultGetSize(item) {
  const img = $(item).find('img').get(0);
  if (!img) return undefined;

  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
};

function defaultGetGravity(item) {
  return 0;
};

function defaultGetResistance(item) {
  return .5;
}

function defaultWrapper(name, implementation, defaultImplementation) {
  return (item) => {
    let value = implementation(item);

    if (value === undefined && implementation !== defaultImplementation) {
      value = defaultImplementation(item);
    }

    if (value === undefined) {
      throw new Error(`Unable to get ${name} of item.`);
    }

    return value;
  };
};

/**
 * Layout items in a grid, with squared edges!
 */
export default class Squid {
  constructor($container, options) {
    this.options = {
      columns: 2,
      gutter: 10,

      getSize: defaultGetSize,
      getGravity: defaultGetGravity,
      getResistance: defaultGetResistance,

      firstRenderClassname: 'squid-initialized',
      resizingClassname: 'squid-resizing',
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

  _initResizeHandler() {
    // Re-layout grid on window resize
    let timeout = null;

    this.$window.on('resize', (event) => {
      window.clearTimeout(timeout);
      this.$container.addClass(this.options.resizingClassname);

      this.layout();

      timeout = window.setTimeout(() => {
        this.$container.removeClass(this.options.resizingClassname);
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
  update(options, layout = true) {
    Object.assign(this.options, options);
    this._updateLayoutOptions();

    if (layout) {
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
  add(...items) {
    // Get insertion index
    const index = (typeof items[items.length - 1] === 'number')
      ? items.pop()
      : this.items.length;

    this.items.splice(index, 0, ...items);
  }

  /**
   * Remove items from the grid.
   *
   * @param item...
   *        An item to remove from the grid.
   */
  remove(...items) {
    for (let item of items) {
      const index = this.items.indexOf(item);

      if (index !== -1) {
        this.items.splice(index, 1);
      }
    }
  }

  /**
   * Remove all items from the grid.
   */
  removeAll() {
    this.items = [];
  }

  /**
   * Re-render the grid.
   */
  layout() {
    let height = 0;

    // Get layout blocks
    const blocks = layout(
      this.items,
      this.$container.width(),
      this.layoutOptions
    );

    // Position blocks
    for (let block of blocks) {
      $(block.object).css({
        position: 'absolute',
        top: block.top,
        left: block.left,
        width: block.width,
        height: block.height,
      });

      height = Math.max(height, block.top + block.height);
    }

    // Update container
    this.$container.css('height', height);
    this.$container.addClass(this.options.firstRenderClassname);
  }

  _updateLayoutOptions() {
    this.layoutOptions = {
      columns: this.options.columns,
      gutter: this.options.gutter,

      // Wrap the sizer functions to handle fallbacks
      getSize: defaultWrapper('size', this.options.getSize, defaultGetSize),
      getGravity: defaultWrapper('gravity', this.options.getGravity, defaultGetGravity),
      getResistance: defaultWrapper('resistance', this.options.getResistance, defaultGetResistance),
    };
  }
}
