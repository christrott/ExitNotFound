/*
  TODO
  - Generate and draw sky
  - Touch controls
  - Map icon for touch/click
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
var maze = loadNextMaze();

function loadNextMaze() {
  player.reset();
  const newMaze = new Maze();
  newMaze.playerRadius = newMaze.blockSize * newMaze.sizeFactor;
  var grid = Array(newMaze.mazeWidth).fill(0).map(() => Array(newMaze.mazeHeight).fill(0));
  newMaze.expandedGrid = Array(newMaze.mazeWidth * 2).fill(0).map(() => Array(newMaze.mazeHeight * 2).fill(0));
  newMaze.divide(grid, 0, 0, newMaze.mazeWidth, newMaze.mazeHeight, newMaze.chooseOrientation(newMaze.mazeWidth, newMaze.mazeHeight, rand), rand);
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
    maze.drawExpandedMaze(ctx);
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

  if (player.exited) {
    loadNextMaze();
  }
});
