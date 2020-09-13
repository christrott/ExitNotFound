/*
  Potential Improvements
  - Vision range & lighting
  - Draw the vision arc with a cone, resize cone to reflect actual vision range
*/

// Load deps
var raf = require('./raf');
var rng = require('./rng');
var Maze = require('./maze');
var Player = require('./player');
var Controls = require('./controls');
var Camera = require('./camera');
var Noise = require('./noise');


// Init game config
var currentStage = 0;
var moveSpeed = 3;
var noise = new Noise();
noise.seed(Math.random());
var canvas = document.querySelector('#game');
var ctx = canvas.getContext('2d');
var seed = Math.random();
var rand = rng(seed);
var controls = new Controls();
var player = new Player();
var currentCamera = new Camera(canvas, 320, 0.8);
var maze = loadNextMaze(10, 10);
currentCamera.generateSky(ctx, noise);

function loadNextMaze(mazeWidth, mazeHeight) {
  currentStage++;
  player.reset();
  const newMaze = new Maze();
  newMaze.mazeWidth = mazeWidth;
  newMaze.mazeHeight = mazeHeight;
  newMaze.playerRadius = newMaze.blockSize * newMaze.sizeFactor / 2;
  var grid = Array(newMaze.mazeWidth / 2).fill(0).map(() => Array(newMaze.mazeHeight / 2).fill(0));
  newMaze.expandedGrid = Array(newMaze.mazeWidth).fill(0).map(() => Array(newMaze.mazeHeight).fill(0));
  newMaze.divide(grid, 0, 0, newMaze.mazeWidth / 2, newMaze.mazeHeight / 2, newMaze.chooseOrientation(newMaze.mazeWidth / 2, newMaze.mazeHeight / 2, rand), rand);
  newMaze.expandGrid(grid);
  return newMaze;
}

function drawGui() {
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#BBBBBB';
  ctx.fillText(`Stage ${currentStage}`, 10, 20);
  ctx.fillText(`Steps ${Math.round(player.totalSteps)}`, 10, 45);
}

// Loop it!
raf.start(function(elapsed) {
  // Clear the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  currentCamera.render(player, maze);

  // Draw maze
  if (controls.showMaze) {
    maze.drawExpandedMaze(canvas, player, { x: player.x, y: player.y });
  }
  drawGui();

  // Update player pos
  if (controls.states.left) {
    player.rotate(-Math.PI * elapsed);
  }
  if (controls.states.right) {
    player.rotate(Math.PI * elapsed);
  }
  if (controls.states.forward) {
    player.move(moveSpeed * elapsed, maze);
  }
  if (controls.states.backward) {
    player.move(-moveSpeed * elapsed, maze);
  }

  if (player.exited) {
    maze = loadNextMaze(maze.mazeWidth * 2, maze.mazeHeight * 2);
  }
});
