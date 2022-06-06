export const select = {
  template: {
    tableId: 'tableTemplate',
    summary: 'summaryTemplate'
  },
  containerOf: {
    pagesId: 'pages',
    aboutId: 'about',
    finderId: 'pathfinder'
  },
  pathfinder: {
    title: '.title h4',
    array: 'table',
    button: 'button',
    alert: '.alert-box',
    popupBackground: 'summary-background',
    popupMessageContainer: '.info-box'
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
    optimal: 'optimal',
    selectedNeighbour: 'neighbour',
    alertActive: 'active'
  },
  popup: {
    'active': 'active'
  }
};

export const states = {
  pathfinder: {
    draw: 'draw',
    startEnd: 'start_end',
    path: 'path'
  }
};

export const settings = {
  moves: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, 1], [1, 1], [1, -1], [-1, -1]],
  alertDuration: 1200,
  rowsCount: 10,
  columnsCount: 10
};
