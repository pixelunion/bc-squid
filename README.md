# Squid, the friendly squared-grid layout engine!

Squid arranges elements into a grid, but makes sure that the bottom is flush.

## Example

```
// Initialize grid
const squid = new Squid($('.grid'), {
  columns: 2,
  gutter: 10,
});

// Add items
squid.add(...$('.grid-item'));

// Remove items
squid.remove($('.grid-item').get(0));

// Render grid
squid.layout();
```


## Options

### `columns`

The number of columns in the grid.

### `gutter`

The size of the gutter, in pixels. If the number is between 0 and 1, it will act
as a percentage of the grid's width.

### `getSize` (optional)

A function to calculate the natural size of your elements. Defaults to the
natural size of the first img element. Expects an object with `width` and
`height` properties.

### `getGravity` (optional)

A function to calculate the "gravity" of your elements. This affects the
position items are inserted into a column. Items with a lower gravity are placed
above items with a higher gravity. Expects a number between `-1` and `1`.

### `getResistance` (optional)

A function to calculate the "resistance" of your elements. Elements with a
higher resistance will be compressed less when trying to resize a column.
Expects a number between `0` and `1`.

Currently, the layout engine only takes into account a resistance of `1`, which
will lock that element's height. All other elements will be compressed equally.

### `getVisibility` (optional)

A function to calculate the visibility of your elements. Expects either `true`
or `false`. If this function returns `false` for an item, that item will not be
layed-out.

### `firstRenderClassname` (optional)

The class name to add to the grid after it is rendered for the first time.

### `resizingClassname` (optional)

Class name to add to the grid while it is being resized.


## Methods

### `update(options, layout = true)`

Change the grid's options, and optionally re-render it. Any options the
constructor can take can be set here.

### `add(...items)`

Add items to the grid.

Since jQuery wraps DOM elements, we can't compare them directly:
`$('#item-1') !== $('#item-1')`. It's recommended to add bare DOM elements
instead.

### `remove(...items)`

Remove items from the grid.

### `removeAll()`

Remove all items from the grid.

### `layout()`

Re-render the grid.
