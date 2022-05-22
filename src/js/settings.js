export const select = {
  template: {
    tableId: 'tableTemplate'
  },
  containerOf: {
    pagesId: 'pages',
    aboutId: 'about',
    finderId: 'pathfinder'
  },
  pathfinder: {
    title: '.title h4',
    array: 'table',
    button: 'button'
  },
  nav: {
    links: 'nav a'
  }
};

export const classNames = {
  pages: {
    active: 'active'
  },
  nav: {
    active: 'active'
  },
  finderArray: {
    selected: 'selected',
    start: 'start',
    end: 'end',
    optimal: 'optimal'
  }
};

export const states = {
  pathfinder: {
    draw: 'draw',
    startEnd: 'start_end',
    path: 'path'
  }
};
