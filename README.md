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
natural size of the first img element.

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
