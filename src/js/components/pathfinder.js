import { select, classNames, states, settings } from '../settings.js';

class Pathfinder {
  constructor() {
    const thisPathfinder = this;
    thisPathfinder.array = [];
    thisPathfinder.selectionNeighbours = new Set();
    thisPathfinder.start = false;
    thisPathfinder.end = false;
    thisPathfinder.state = states.pathfinder.draw;

    thisPathfinder.getDomElements();
    thisPathfinder.createArray();
    thisPathfinder.initActions();
  }

  getDomElements() {
    const thisPathfinder = this;

    thisPathfinder.dom = {};
    thisPathfinder.dom.wrapper = document.getElementById(select.containerOf.finderId);
    thisPathfinder.dom.title = thisPathfinder.dom.wrapper.querySelector(select.pathfinder.title);
    thisPathfinder.dom.table = thisPathfinder.dom.wrapper.querySelector(select.pathfinder.array);
    thisPathfinder.dom.button = thisPathfinder.dom.wrapper.querySelector(select.pathfinder.button);
    thisPathfinder.dom.alert = thisPathfinder.dom.wrapper.querySelector(select.pathfinder.alert);
    thisPathfinder.dom.popup = document.getElementById(select.pathfinder.popupBackground);
    thisPathfinder.dom.popupMsg = thisPathfinder.dom.popup.querySelector(select.pathfinder.popupMessageContainer);
  }

  createArray() {
    const thisPathfinder = this;
    thisPathfinder.array = [];
    for (let r = 0; r < settings.rowsCount; r++) {
      thisPathfinder.array.push([]);
      for (let c = 0; c < settings.columnsCount; c++) {
        thisPathfinder.array[thisPathfinder.array.length - 1].push(0);
      }
    }
    const templateRaw = document.getElementById(select.template.tableId).innerHTML;
    const tableTemplate = Handlebars.compile(templateRaw);
    thisPathfinder.dom.table.innerHTML = tableTemplate({ array: thisPathfinder.array });
  };

  initActions() {
    const thisPathfinder = this;

    thisPathfinder.dom.table.addEventListener('click', function(event) {
      thisPathfinder.cellProcessing(event);
      thisPathfinder.colorNeighbours();
    });
    thisPathfinder.dom.button.addEventListener('click', function() {
      thisPathfinder.buttonAction();
    });
  };

  cellProcessing(event) {
    const thisPathfinder = this;

    console.log('col', event.target.dataset.col);
    console.log('row', event.target.parentElement.dataset.row);
    let row = parseInt(event.target.parentElement.dataset.row);
    let col = parseInt(event.target.dataset.col);

    //  if state draw => draw paths
    if (thisPathfinder.state === states.pathfinder.draw) {
      //  select first point
      if (!thisPathfinder.array.some((row) => row.some(cell => cell > 0))) {
        console.log('empty');
        thisPathfinder.array[row][col] = 1;
        event.target.classList.add(classNames.finderArray.selected);
      } else {
        // continue line

        //count active neighbours
        let neighbours = 0;
        let rowN;
        let colN;
        for (let move of settings.moves) {
          rowN = row + move[0];
          colN = col + move[1];
          if (colN >= 0 && colN <= 9 && rowN >= 0 && rowN <= 9) {
            neighbours += thisPathfinder.array[rowN][colN];
          }
        }
        //console.log('neighbours: ', neighbours);
        if (neighbours > 0 && thisPathfinder.array[row][col] === 0) {
          thisPathfinder.array[row][col] = 1;
          event.target.classList.add(classNames.finderArray.selected);
        } else if (thisPathfinder.array[row][col] === 1 && neighbours < 2) {
          thisPathfinder.array[row][col] = 0;
          event.target.classList.remove(classNames.finderArray.selected);
        } else {
          //console.log('non match');
          thisPathfinder.callAlert('Holes in path are not allowed.');
        }
      }
    }
    //  elif state start-end point -> select start/end points
    else if (thisPathfinder.state === states.pathfinder.startEnd) {
      if (thisPathfinder.array[row][col] === 1) {
        if (!thisPathfinder.start) {
          thisPathfinder.array[row][col] = 2;
          event.target.classList.replace(classNames.finderArray.selected, classNames.finderArray.start);
          thisPathfinder.start = [row, col];
        } else if (!thisPathfinder.end) {
          thisPathfinder.array[row][col] = 3;
          event.target.classList.replace(classNames.finderArray.selected, classNames.finderArray.end);
          thisPathfinder.end = [row, col];
        }
      } else if (thisPathfinder.array[row][col] === 2) {
        thisPathfinder.array[row][col] = 1;
        event.target.classList.replace(classNames.finderArray.start, classNames.finderArray.selected);
        thisPathfinder.start = false;
      } else if (thisPathfinder.array[row][col] === 3) {
        thisPathfinder.array[row][col] = 1;
        event.target.classList.replace(classNames.finderArray.end, classNames.finderArray.selected);
        thisPathfinder.end = false;
      } else {
        thisPathfinder.callAlert('Select point within the path.');
      }
      if (!thisPathfinder.start) {
        thisPathfinder.dom.title.innerHTML = 'SELECT START POINT';
      } else if (thisPathfinder.start && !thisPathfinder.end) {
        thisPathfinder.dom.title.innerHTML = 'SELECT END POINT';
      } else if (thisPathfinder.start && thisPathfinder.end) {
        thisPathfinder.dom.title.innerHTML = 'COMPUTE';
      }
    }
  };

  buttonAction() {
    const thisPathfinder = this;

    //console.log('button');
    if (thisPathfinder.state === states.pathfinder.draw) {
      if (thisPathfinder.array.reduce((sum, row) => sum + row.reduce((cell1, cell2) => cell1 + cell2), 0) > 1) {
        thisPathfinder.state = states.pathfinder.startEnd;
        thisPathfinder.dom.button.innerHTML = 'COMPUTE';
        thisPathfinder.dom.title.innerHTML = 'SELECT START POINT';
      } else {
        //console.log('no path');
        thisPathfinder.callAlert('Please draw the path first.');
      }
    } else if (thisPathfinder.state === states.pathfinder.startEnd) {
      // if start and end point selected
      if (thisPathfinder.start && thisPathfinder.end) {
        thisPathfinder.computePath();
        thisPathfinder.state = states.pathfinder.path;
        thisPathfinder.dom.button.innerHTML = 'START AGAIN';
        thisPathfinder.dom.title.innerHTML = 'THE BEST ROUTE IS...';
      } else if (thisPathfinder.start) {
        //console.log('there is no end');
        thisPathfinder.callAlert('Select end point.');
      } else if (thisPathfinder.end) {
        //console.log('there is no start');
        thisPathfinder.callAlert('Select start point.');
      } else {
        //console.log('there is nothing');
        thisPathfinder.callAlert('Select start and end point.');
      }
      // else print message draw paths
    } else if (thisPathfinder.state === states.pathfinder.path) {
      thisPathfinder.createArray();
      thisPathfinder.selectionNeighbours = new Set();
      thisPathfinder.start = false;
      thisPathfinder.end = false;
      thisPathfinder.state = states.pathfinder.draw;
      thisPathfinder.dom.button.innerHTML = 'FINISH DRAWING';
      thisPathfinder.dom.title.innerHTML = 'DRAW ROUTES';
    }
  };

  computePath() {
    const thisPathfinder = this;

    const possiblePaths = [];
    const directions = settings.moves;
    let currentLength = false;
    // distance + 1 because path include start and end point (distance of one cell = two cells path)
    let distance = 999;
    if (settings.moves.length === 4) {
      distance = Math.abs(thisPathfinder.start[0] - thisPathfinder.end[0]) + Math.abs(thisPathfinder.start[1] - thisPathfinder.end[1]) + 1;
    } else if (settings.moves.length === 8) {
      distance = (Math.abs(thisPathfinder.start[0] - thisPathfinder.end[0]) + Math.abs(thisPathfinder.start[1] - thisPathfinder.end[1])) / 2 + 1;
    }
    const move = (positions, row, column) => {
      positions.push({ r: row, c: column });
      // if current position reach end value add positions to possible paths (only if its shorter then previous ones
      if (thisPathfinder.array[row][column] === 3) {
        if (!currentLength || positions.length < currentLength) {
          possiblePaths.push(positions);
          currentLength = positions.length;
          // if path length is equal to shortest possible distance, break search
          if (currentLength === distance) {
            return true;
          }
        }
      }
      // continue only if current positions are shorter than current shortest way found
      if (!currentLength || positions.length < currentLength) {
        // sort directions -> prefer the ones that shorten the distance to end point
        const dirs = directions.sort((a, b) => {
          const distanceA = Math.abs(row + a[0] - thisPathfinder.end[0]) + Math.abs(column + a[1] - thisPathfinder.end[1]);
          const distanceB = Math.abs(row + b[0] - thisPathfinder.end[0]) + Math.abs(column + b[1] - thisPathfinder.end[1]);
          return distanceA - distanceB;
        });
        // recursive call for each possible move
        for (let direction of dirs) {
          const in_array = row + direction[0] >= 0 && row + direction[0] <= 9 && column + direction[1] >= 0 && column + direction[1] <= 9;
          const is_on_path = in_array ? thisPathfinder.array[row + direction[0]][column + direction[1]] > 0 : false;
          if (is_on_path) {
            if (!positions.some(p => p.r === row + direction[0] && p.c === column + direction[1])) {
              move([...positions], row + direction[0], column + direction[1]);
            }
          }
        }
      }
    };

    move([], thisPathfinder.start[0], thisPathfinder.start[1]);
    //console.log('posible: ', possiblePaths);
    thisPathfinder.optimalPath = possiblePaths.reduce((path1, path2) => path1.length < path2.length ? path1 : path2);
    //console.log('optimal: ', thisPathfinder.optimalPath);
    thisPathfinder.longestPath = possiblePaths.reduce((path1, path2) => path1.length > path2.length ? path1 : path2);
    thisPathfinder.colorOptimalPath();
    thisPathfinder.callSummaryPopUp();
  };

  colorOptimalPath() {
    const thisPathfinder = this;

    for (let position of thisPathfinder.optimalPath) {
      const row = String(position.r);
      const col = String(position.c);

      const rowDom = thisPathfinder.dom.table.querySelector('[data-row="' + row + '"]');
      const cellDom = rowDom.querySelector('[data-col="' + col + '"]');
      cellDom.classList.add(classNames.finderArray.optimal);
    }
  };

  colorNeighbours() {
    const thisPathfinder = this;

    console.log(thisPathfinder);
    //  find neighbours
    let neighbours = new Set();
    for (let row in thisPathfinder.array) {
      for (let column in thisPathfinder.array[row]) {
        row = parseInt(row);
        column = parseInt(column);
        if (thisPathfinder.array[row][column]) {
          let rowN;
          let colN;
          for (let move of settings.moves) {
            rowN = row + move[0];
            colN = column + move[1];
            if (colN >= 0 && colN <= 9 && rowN >= 0 && rowN <= 9) {
              if (!thisPathfinder.array[rowN][colN]) {
                neighbours.add(JSON.stringify({ r: rowN, c: colN }));
              }
            }
          }
        }
      }
    }
    //  old neighbours remove class
    //console.log(neighbours);
    const oldNeighbours = [...thisPathfinder.selectionNeighbours].filter(x => !neighbours.has(x));
    for (let position of oldNeighbours) {
      position = JSON.parse(position);
      const r = String(position.r);
      const c = String(position.c);
      const rowDom = thisPathfinder.dom.table.querySelector('[data-row="' + r + '"]');
      const cellDom = rowDom.querySelector('[data-col="' + c + '"]');
      cellDom.classList.remove(classNames.finderArray.selectedNeighbour);
    }
    //  new neighbours add class
    const newNeighbours = [...neighbours].filter(x => !thisPathfinder.selectionNeighbours.has(x));
    for (let position of newNeighbours) {
      position = JSON.parse(position);
      const r = String(position.r);
      const c = String(position.c);
      const rowDom = thisPathfinder.dom.table.querySelector('[data-row="' + r + '"]');
      const cellDom = rowDom.querySelector('[data-col="' + c + '"]');
      cellDom.classList.add(classNames.finderArray.selectedNeighbour);
    }
    // reset neighbours
    thisPathfinder.selectionNeighbours = neighbours;
  };

  calcStatistics() {
    const thisPathfinder = this;

    const activeFields = thisPathfinder.array.flat(2).reduce((prev, next) => {
      return prev + (next > 0 ? 1 : 0);
    }, 0);

    thisPathfinder.summary = {
      activeFields: activeFields,
      shortestWay: thisPathfinder.optimalPath.length,
      longestWay: thisPathfinder.longestPath.length
    };

  };

  callAlert(msg) {
    const thisPathfinder = this;

    thisPathfinder.dom.alert.innerHTML = msg;
    thisPathfinder.dom.alert.style.opacity = '1';
    setTimeout(function() {
      thisPathfinder.dom.alert.style.opacity = '0';
    }, settings.alertDuration);
  };

  callSummaryPopUp() {
    const thisPathfinder = this;

    thisPathfinder.calcStatistics();
    const templateMsgRaw = document.getElementById(select.template.summary).innerHTML;
    const templateMsg = Handlebars.compile(templateMsgRaw);
    thisPathfinder.dom.popupMsg.innerHTML = templateMsg(thisPathfinder.summary);
    thisPathfinder.dom.popup.classList.add(classNames.popup.active);
    thisPathfinder.dom.popup.querySelector('.close-btn').addEventListener('click', () => {
      thisPathfinder.dom.popup.classList.remove(classNames.popup.active);
    });
  };
}

export default Pathfinder;
