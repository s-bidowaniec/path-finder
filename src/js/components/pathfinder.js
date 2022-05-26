import { select, classNames, states } from '../settings.js';

class Pathfinder {
  constructor() {
    const thisPathfinder = this;
    thisPathfinder.array = [];
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
  }

  createArray() {
    const thisPathfinder = this;

    thisPathfinder.array = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
    const templateRaw = document.getElementById(select.template.tableId).innerHTML;
    const tableTemplate = Handlebars.compile(templateRaw);
    thisPathfinder.dom.table.innerHTML = tableTemplate({ array: thisPathfinder.array });
  };

  initActions() {
    const thisPathfinder = this;

    thisPathfinder.dom.table.addEventListener('click', function(event) {
      thisPathfinder.cellProcessing(event);
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
        const neighbours = Number(col < 9 ? thisPathfinder.array[row][col + 1] > 0 : 0) +
          Number(col > 0 ? thisPathfinder.array[row][col - 1] > 0 : 0) +
          Number(row < 9 ? thisPathfinder.array[row + 1][col] > 0 : 0) +
          Number(row > 0 ? thisPathfinder.array[row - 1][col] > 0 : 0);
        console.log('neighbours: ', neighbours);
        if (neighbours > 0 && thisPathfinder.array[row][col] === 0) {
          thisPathfinder.array[row][col] = 1;
          event.target.classList.add(classNames.finderArray.selected);
        } else if (thisPathfinder.array[row][col] === 1 && neighbours < 2) {
          thisPathfinder.array[row][col] = 0;
          event.target.classList.remove(classNames.finderArray.selected);
        } else {
          console.log('non match');
          //  TO DO silent alert
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

    console.log('button');
    if (thisPathfinder.state === states.pathfinder.draw) {
      if (thisPathfinder.array.reduce((sum, row) => sum + row.reduce((cell1, cell2) => cell1 + cell2), 0) > 1) {
        thisPathfinder.state = states.pathfinder.startEnd;
        thisPathfinder.dom.button.innerHTML = 'COMPUTE';
        thisPathfinder.dom.title.innerHTML = 'SELECT START POINT';
      } else {
        console.log('no path');
      }
    } else if (thisPathfinder.state === states.pathfinder.startEnd) {
      // TO DO if start and end point selected
      if (thisPathfinder.start && thisPathfinder.end) {
        thisPathfinder.computePath();
        thisPathfinder.state = states.pathfinder.path;
        thisPathfinder.dom.button.innerHTML = 'START AGAIN';
        thisPathfinder.dom.title.innerHTML = 'THE BEST ROUTE IS...';
      } else if (thisPathfinder.start) {
        console.log('there is no end');
      } else if (thisPathfinder.end) {
        console.log('there is no start');
      } else {
        console.log('there is nothing');
      }
      // else print message draw paths
    } else if (thisPathfinder.state === states.pathfinder.path) {
      thisPathfinder.createArray();
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
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let currentLength = false;
    // distance + 1 because path include start and end point (distance of one cell = two cells path)
    const distance = Math.abs(thisPathfinder.start[0] - thisPathfinder.end[0]) + Math.abs(thisPathfinder.start[1] - thisPathfinder.end[1]) + 1;
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
    console.log('posible: ', possiblePaths);
    thisPathfinder.optimalPath = possiblePaths.reduce((path1, path2) => path1.length < path2.length ? path1 : path2);
    console.log('optimal: ', thisPathfinder.optimalPath);
    thisPathfinder.colorOptimalPath();
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

}

export default Pathfinder;
