import $ from 'jquery';
import Squid from '../src/Squid';

const random = function(min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
};

// Give random colors to all grid items
const colorize = function() {
  $('.grid-item').each((index, el) => {
    const $item = $(el);
    if ($item.data('color')) return;

    const hue = random(0, 360);
    const sat = random(50, 80);
    const light = random(50, 80);
    const color = `hsl(${hue}, ${sat}%, ${light}%)`;

    $item.data('color', color);
    $item.css('background-color', color);

    const size = $item.data('size');
    $item.html(`<span>${size.width}x${size.height}</span>`);
  });
};

// Generate a random size for an item
const getSize = function(item) {
  let size = $(item).data('size');

  if (!size) {
    size = {
      width: 300,
      height: random(100, 500),
    };

    $(item).data('size', size);
  }

  return size;
};

// App

$(() => {
  let columns = 4;
  let gutters = [2, 5, 10, 50, .05, 0];
  let gutterIndex = 0;

  // Init grid
  const squid = new Squid($('.grid'), {
    columns: columns,
    gutter: gutters[gutterIndex],
    getSize,
  });

  squid.add(...$('.grid-item'));
  squid.layout();
  colorize();

  // Add action -- add more items to the grid
  $('[data-action-add-items]').on('click', (event) => {
    for (let i = 0; i < random(1, 5); i++) {
      const $item = $('<div>', {
        'class': 'grid-item',
      }).appendTo('.grid');
      squid.add($item.get(0));
    }
    squid.layout();
    colorize();
  });

  // Add column
  $('[data-action-add-column]').on('click', (event) => {
    columns += 1;
    squid.update({ columns });
  });

  // Remove column
  $('[data-action-remove-column]').on('click', (event) => {
    columns = Math.max(1, columns - 1);
    squid.update({ columns });
  });

  // Adjust gutters
  $('[data-action-gutter]').on('click', (event) => {
    gutterIndex = gutterIndex >= gutters.length - 1
      ? 0
      : gutterIndex + 1;
    squid.update({ gutter: gutters[gutterIndex] });
  });

  // Remove a grid item when clicking on it
  $(document.body).on('click', '.grid-item', (event) => {
    squid.remove(event.currentTarget);
    $(event.currentTarget).remove();
    squid.layout();
  });
});
