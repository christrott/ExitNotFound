/*
  TODO
  - Add marker to the 2d maze to indicate the exit location (value == 2)
  - Render 3d maze marker to indicate the exit location (value == 2)
  - Touch controls
  - Map icon for touch/click
  - Draw the vision arc with a cone, resize to reflect actual vision range
*/

var raf = require('./raf');
var rng = require('./rng');
var Maze = require('./maze');
var camera = require('./camera');

var canvas = document.querySelector('#game');
var ctx = canvas.getContext('2d');

var seed = 2;
var rand = rng(seed);
var MoveSpeed = 5;
var showMaze = false;

class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.direction = 0;
    this.totalSteps = 0;
  }

  move(moveStep, maze, grid) {
    var dx = Math.cos(this.direction) * moveStep;
    var dy = Math.sin(this.direction) * moveStep;
    // Check grid for collisions
    if (maze.check(this.x + dx, this.y, grid) === 0) {
      this.x += dx;
    }
    if (maze.check(this.x, this.y + dy, grid) === 0) {
      this.y += dy;
    }
    this.totalSteps += moveStep;
  }

  rotate(angle) {
    this.direction = (this.direction + angle + (Math.PI * 2)) % (Math.PI * 2);
  }
}

class Controls {
  constructor() {
    this.codes = { 37: 'left', 39: 'right', 38: 'forward', 40: 'backward' };
    this.states = { left: false, right: false, forward: false, backward: false };
    document.addEventListener('keydown', this.onKey.bind(this, true), false);
    document.addEventListener('keyup', this.onKey.bind(this, false), false);
  }

  onKey(val, e) {
    if (e.keyCode === 77) { // M keyCode
      showMaze = val;
    }
    var state = this.codes[e.keyCode];
    if (typeof state === 'undefined') {
      return;
    }
    this.states[state] = val;
    e.preventDefault && e.preventDefault();
    e.stopPropogation && e.stopPropogation();
  }
};


var maze = new Maze();
var controls = new Controls();
var player = new Player();
var currentCamera = camera(canvas, 320, 0.8);
maze.blockSize = 1;
maze.sizeFactor = 8;
//maze.mazeWidth = Math.floor(canvas.width * 0.5 / 4); //Math.floor(canvas.width / maze.blockSize / maze.sizeFactor);
//maze.mazeHeight = Math.floor(canvas.height * 0.5 / 4); //Math.floor(canvas.height / maze.blockSize / maze.sizeFactor);
maze.playerRadius = maze.blockSize * maze.sizeFactor;
var grid = Array(maze.mazeWidth).fill(0).map(() => Array(maze.mazeHeight).fill(0));
maze.expandedGrid = Array(maze.mazeWidth * 2).fill(0).map(() => Array(maze.mazeHeight * 2).fill(0));
maze.divide(grid, 0, 0, maze.mazeWidth, maze.mazeHeight, maze.chooseOrientation(maze.mazeWidth, maze.mazeHeight, rand), rand);
maze.expandGrid(grid);
console.log(grid);
console.log(maze.expandedGrid);

raf.start(function(elapsed) {
  // Clear the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  currentCamera.render(player, maze);

  // Draw maze
  if (showMaze) {
    maze.drawExpandedMaze(ctx);
    //maze.drawMaze(ctx, grid);
    let scaleFactor = maze.sizeFactor;
    // Draw direction cone
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(player.x * scaleFactor, player.y * scaleFactor, maze.playerRadius * scaleFactor, player.direction - Math.PI/3, player.direction + Math.PI/3, false);
    ctx.fillStyle = '#009900';
    ctx.fill();

    // Draw player
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(player.x * scaleFactor, player.y * scaleFactor, maze.playerRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#990000';
    ctx.fill();
  }

  // Update player pos
  if (controls.states.left) {
    player.rotate(-Math.PI * elapsed);
  }
  if (controls.states.right) {
    player.rotate(Math.PI * elapsed);
  }
  if (controls.states.forward) {
    player.move(MoveSpeed * elapsed, maze);
  }
  if (controls.states.backward) {
    player.move(-MoveSpeed * elapsed, maze);
  }
});
