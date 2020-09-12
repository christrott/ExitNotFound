/*
  TODO
  - Map icon for touch/click
  - Generate and draw sky
  - Vision range
  - Draw the vision arc with a cone, resize to reflect actual vision range
  - SFX: Footsteps
  - SFX: Breathing based on movement distance delta time
*/

// Load deps
var raf = require('./raf');
var rng = require('./rng');
var Maze = require('./maze');
var Player = require('./player');
var Controls = require('./controls');
var camera = require('./camera');

// Init game config
var canvas = document.querySelector('#game');
var ctx = canvas.getContext('2d');
var seed = 2;
var rand = rng(seed);
var MoveSpeed = 5;
var controls = new Controls();
var player = new Player();
var currentCamera = camera(canvas, 320, 0.8);
var maze = loadNextMaze(10, 10);

function loadNextMaze(mazeWidth, mazeHeight) {
  console.log(`loadNextMaze(${mazeWidth}, ${mazeHeight})`);
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

// Loop it!
raf.start(function(elapsed) {
  // Clear the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  currentCamera.render(player, maze);

  // Draw maze
  if (controls.showMaze) {
    maze.drawExpandedMaze(canvas, player, { x: player.x, y: player.y });
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

  if (player.exited) {
    maze = loadNextMaze(maze.mazeWidth * 2, maze.mazeHeight * 2);
  }
});
