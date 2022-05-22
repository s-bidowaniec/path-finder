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
      // TO DO if paths drawed
      thisPathfinder.state = states.pathfinder.startEnd;
      thisPathfinder.dom.button.innerHTML = 'COMPUTE';
      thisPathfinder.dom.title.innerHTML = 'SELECT START POINT';
      // else print message draw paths
    } else if (thisPathfinder.state === states.pathfinder.startEnd) {
      // TO DO if start and end point selected
      // call calculate path function
      thisPathfinder.computePath();
      thisPathfinder.state = states.pathfinder.path;
      thisPathfinder.dom.button.innerHTML = 'START AGAIN';
      thisPathfinder.dom.title.innerHTML = 'THE BEST ROUTE IS...';
      // else print message draw paths
    } else if (thisPathfinder.state === states.pathfinder.path) {
      // restart array
      thisPathfinder.createArray();
      thisPathfinder.state = states.pathfinder.draw;
      thisPathfinder.dom.button.innerHTML = 'FINISH DRAWING';
      thisPathfinder.dom.title.innerHTML = 'DRAW ROUTES';
    }
  };

  computePath() {
    const thisPathfinder = this;

    const possiblePaths = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const move = (positions, row, column) => {
      console.log('row', row);
      console.log('col', column);

      if (thisPathfinder.array[row][column] === 3) {
        possiblePaths.push(positions);
      }
      for (let direction of directions) {
        if (thisPathfinder.array[row + direction[0]][column + direction[1]] > 0) {
          if (!positions.some(p => p.r === row + direction[0] && p.c === column + direction[1])) {
            positions.push({ r: row, c: column });
            move(positions, row + direction[0], column + direction[1]);
          }
        }
      }
    };
    move([], thisPathfinder.start[0], thisPathfinder.start[1]);
    console.log('posible: ', possiblePaths);
    // TO DO find optimal path
    // TO DO change array values for optimal path
  };
}

export default Pathfinder;
