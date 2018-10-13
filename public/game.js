class Grid {
  constructor(map) {
    this.cols = map.length;
    this.rows = map[0].length;
    this.grid = new Array(this.cols);
    this.setup();
    this.openSet = new TinyQueue();
    this.closedSet = [];
  }

  setup() {
    for (let i = 0; i < this.cols; i++) {
      this.grid[i] = new Array(this.rows);
    }
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let wall = map[i][j];
        this.grid[i][j] = new Spot(i, j, wall);
      }
    }
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        this.grid[i][j].addNeighbors(this);
      }
    }
  }

  find(i1, j1, i2, j2) {
    // cleanup to enable a new search over the same array
    this.closedSet = [];
    this.openSet = new TinyQueue();
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        this.grid[i][j].f = 0;
        this.grid[i][j].g = 0;
        this.grid[i][j].h = 0;
        this.grid[i][j].previous = undefined;
      }
    }

    this.start = this.grid[i1][j1];
    this.end = this.grid[i2][j2];
    this.openSet.push(this.start);
    while (this.openSet.length > 0) {
      var current = this.openSet.pop();
      console.log(current.i, current.j);
      if (current === this.end) {
        console.log("Done");
        let temp = current;
        const path = []
        path.push(temp);
        while (temp.previous) {
          path.push(temp.previous);
          temp = temp.previous;
        }
        return path;
      }
      this.closedSet.push(current);

      // add candidates where to go
      let neighbors = current.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        if (!this.closedSet.includes(neighbor) && !neighbor.wall) {
          let tempG = current.g + 1;
          let foundNewPath = false;
          if (this.openSet.includes(neighbor)) {
            if (tempG < neighbor.g) { // we found better shorter distance to the end
              neighbor.g = tempG;
              foundNewPath = true;
            }
          } else {
            foundNewPath = true;
          }
          if (foundNewPath) {
            neighbor.h = this.heuristic(neighbor, this.end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.g = tempG;
            neighbor.previous = current;
            this.openSet.push(neighbor);
          }
        }
      }
    }
  }

  heuristic(a, b) {
    // let distance = dist(a.i, a.j, b.i, b.j);
    let distance = Math.sqrt(Math.pow(b.i - a.i, 2) + Math.pow(b.j - a.j, 2));
    return distance;
  }
}

class Spot {
  constructor(i, j, wall = false) {
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0; // amount of time, cost, it takes from 0
    this.h = 0; // amount of time, cost, it takes to the end
    this.neighbors = [];
    this.previous = undefined;
    this.wall = wall;
    // if (Math.random(1) < 0.4) {
    //   this.wall = true;
    // }
  }

  addNeighbors(grid) {
    const i = this.i;
    const j = this.j;
    const cols = grid.cols;
    const rows = grid.rows;

    if (i < cols - 1)
      this.neighbors.push(grid.grid[i + 1][j]);
    if (i > 0)
      this.neighbors.push(grid.grid[i - 1][j]);
    if (j < rows - 1)
      this.neighbors.push(grid.grid[i][j + 1]);
    if (j > 0)
      this.neighbors.push(grid.grid[i][j - 1]);
    if (i > 0 && j > 0)
      this.neighbors.push(grid.grid[i - 1][j - 1]);
    if (i < cols - 1 && j > 0)
      this.neighbors.push(grid.grid[i + 1][j - 1]);
    if (i > 0 && j < rows - 1)
      this.neighbors.push(grid.grid[i - 1][j + 1]);
    if (i < cols - 1 && j < rows - 1)
      this.neighbors.push(grid.grid[i + 1][j + 1]);
  }
}

let grid;
const squareSize = 20;
const halfSize = squareSize / 2;

let a;
let aTo;
let aPath = [];

let map = undefined;

const socket = io();
let players = {};
let previousPlayers = {};
socket.on('moving', (msg) => {
  previousPlayers = players;
  players = msg.players;
});
socket.on('startGame', (msg) => {
  map = msg.map;
  console.log(map);
  setup()
});

const playerId = uuid();

function setup() {
  if (!map) return;
  // translate(50);
  createCanvas(800, 500);
  frameRate(10);
  grid = new Grid(map)
  a = {i: 9, j: 9};
  aTo = {i: 9, j: 9};
  // noStroke();
  for (let i = 0; i < grid.grid.length; i++) {
    for (let j = 0; j < grid.grid[i].length; j++) {
      if (grid.grid[i][j].wall) fill(123, 123, 123);
      else fill(255, 255, 255);
      ellipse((i * squareSize) + halfSize, (j * squareSize) + halfSize, squareSize / 2, squareSize / 2);
    }
  }
  socket.emit('moving', {id: playerId, i: a.i, j: a.j});
}

function draw() {
  if (!map) return;
  for (const key in players) {
    if (key === playerId) continue;
    if (players.hasOwnProperty(key)) {
      let player = players[key];
      let previousPosition = previousPlayers[key];
      if (previousPosition) {
        fill(255, 255, 255);
        ellipse((previousPosition.i * squareSize) + halfSize, (previousPosition.j * squareSize) + halfSize, squareSize - 10, squareSize - 10);
      }
      fill(196, 127, 138);
      ellipse((player.i * squareSize) + halfSize, (player.j * squareSize) + halfSize, squareSize - 10, squareSize - 10);
    }
  }
  if (a.i === aTo.i && a.j === aTo.j) {
    fill(96, 227, 138);
    ellipse((a.i * squareSize) + halfSize, (a.j * squareSize) + halfSize, squareSize - 10, squareSize - 10);
  } else {
    if (aPath.length > 0) {
      // remove player from current position
      fill(255, 255, 255);
      ellipse((a.i * squareSize) + halfSize, (a.j * squareSize) + halfSize, squareSize - 10, squareSize - 10);
      // draw on a new position
      fill(96, 227, 138);
      const newPosition = aPath.pop();
      ellipse((newPosition.i * squareSize) + halfSize, (newPosition.j * squareSize) + halfSize, squareSize - 10, squareSize - 10);
      a.i = newPosition.i;
      a.j = newPosition.j;
      socket.emit('moving', {id: playerId, i: a.i, j: a.j});
    } else {
      // const path = grid.find(a.i, a.j, aTo.i, aTo.j);
      // if (path)
      //   aPath = path;
      // console.log(aPath);
    }
  }
}

function mouseDragged() {
  udpatePosition();
}

function mouseReleased() {
  udpatePosition();
}

let findNewPath = function () {
  const path = grid.find(a.i, a.j, aTo.i, aTo.j);
  if (path)
    aPath = path;
};

function udpatePosition() {
  let i = parseInt(mouseX / squareSize);
  let j = parseInt(mouseY / squareSize);

  if (i < grid.cols &&
    j < grid.rows &&
    !grid.grid[i][j].wall) {
    aPath = [];
    aTo.i = i;
    aTo.j = j;
    // console.log('a:', a, 'aTo:', aTo);
    findNewPath();
  }
  return false;
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    if (aTo.j > 0 && !grid.grid[aTo.i][aTo.j - 1].wall) {
      aTo.j--;
    }
  } else if (keyCode === DOWN_ARROW) {
    if (aTo.j < grid.rows - 1 && !grid.grid[aTo.i][aTo.j + 1].wall) {
      aTo.j++;
    }
  } else if (keyCode === LEFT_ARROW) {
    if (aTo.i > 0 && !grid.grid[aTo.i - 1][aTo.j].wall) {
      aTo.i--;
    }
  } else if (keyCode === RIGHT_ARROW) {
    if (aTo.i < grid.cols - 1 && !grid.grid[aTo.i + 1][aTo.j].wall) {
      aTo.i++;
    }
  }
}

function uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

class TinyQueue {
  constructor(data = [], compare = defaultCompare) {
    this.data = data;
    this.length = this.data.length;
    this.compare = compare;

    if (this.length > 0) {
      for (let i = (this.length >> 1) - 1; i >= 0; i--) this._down(i);
    }
  }

  push(item) {
    this.data.push(item);
    this.length++;
    this._up(this.length - 1);
  }

  pop() {
    if (this.length === 0) return undefined;

    const top = this.data[0];
    const bottom = this.data.pop();
    this.length--;

    if (this.length > 0) {
      this.data[0] = bottom;
      this._down(0);
    }

    return top;
  }

  peek() {
    return this.data[0];
  }

  includes(i) { // O(n)
    for (const d of this.data) {
      if (d === i) return true;
    }
    return false;
  }

  _up(pos) {
    const {data, compare} = this;
    const item = data[pos];

    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      const current = data[parent];
      if (compare(item, current) >= 0) break;
      data[pos] = current;
      pos = parent;
    }

    data[pos] = item;
  }

  _down(pos) {
    const {data, compare} = this;
    const halfLength = this.length >> 1;
    const item = data[pos];

    while (pos < halfLength) {
      let left = (pos << 1) + 1;
      let best = data[left];
      const right = left + 1;

      if (right < this.length && compare(data[right], best) < 0) {
        left = right;
        best = data[right];
      }
      if (compare(best, item) >= 0) break;

      data[pos] = best;
      pos = left;
    }

    data[pos] = item;
  }
}

function defaultCompare(a, b) {
  return a.f < b.f ? -1 : a.f > b.f ? 1 : 0;
}
