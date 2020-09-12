module.exports = class Maze {
  constructor() {
    // this.mazeWidth = 10;
    // this.mazeHeight = 10;
    this.blockSize = 1;
    this.sizeFactor = 8;
    this.playerRadius = 15;
    this.expandedGrid = [];
    this.wallTexture = { image: new Image(), width: 1, height: 128 };
    this.wallTexture.image.src = 'assets/wallSlice.png';
    this.exitTexture = { image: new Image(), width: 1, height: 128 };
    this.exitTexture.image.src = 'assets/exitSlice.png';
    this.light = 2;
  }

  expandGrid(grid) {
    this.mazeHeight = grid.length * 2;
    this.mazeWidth = grid[0].length * 2;
    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[i].length; j++) {
        const val = grid[i][j];
        if (val === 0) {
          this.expandedGrid[i * 2][j * 2] = 0; // Top Left
          this.expandedGrid[i * 2 + 1][j * 2] = 0; // Bottom Left
          this.expandedGrid[i * 2][j * 2 + 1] = 0; // Top Right
          this.expandedGrid[i * 2 + 1][j * 2 + 1] = 0; // Bottom Right
        }
        if (val === 1) {
          this.expandedGrid[i * 2][j * 2] = 0; // Top Left
          this.expandedGrid[i * 2 + 1][j * 2] = 1; // Bottom Left
          this.expandedGrid[i * 2][j * 2 + 1] = 0; // Top Right
          this.expandedGrid[i * 2 + 1][j * 2 + 1] = 1; // Bottom Right
        }
        if (val === 2) {
          this.expandedGrid[i * 2][j * 2] = 0; // Top Left
          this.expandedGrid[i * 2 + 1][j * 2] = 0; // Bottom Left
          this.expandedGrid[i * 2][j * 2 + 1] = 1; // Top Right
          this.expandedGrid[i * 2 + 1][j * 2 + 1] = 1; // Bottom Right
        }
        if (val === 3) {
          this.expandedGrid[i * 2][j * 2] = 0; // Top Left
          this.expandedGrid[i * 2 + 1][j * 2] = 1; // Bottom Left
          this.expandedGrid[i * 2][j * 2 + 1] = 1; // Top Right
          this.expandedGrid[i * 2 + 1][j * 2 + 1] = 1; // Bottom Right
        }
      }
    }
    this.expandedGrid[this.mazeHeight - 1][this.mazeWidth - 1] = 2; // Set exit point
  }

  drawExpandedMaze(canvas, player, pan) {
    const ctx = canvas.getContext('2d');
    const blk = this.blockSize * this.sizeFactor;
    const offset = { x: (canvas.width - blk * this.mazeWidth) / 2, y: (canvas.height - blk * this.mazeHeight) / 2 };
    ctx.strokeRect(offset.x - (pan.x * blk), offset.y - (pan.y * blk), this.mazeWidth * this.sizeFactor, this.mazeHeight * this.sizeFactor); // Add the outside walls
    for (var i = 0; i < this.mazeHeight; i++) {
      for (var j = 0; j < this.mazeWidth; j++) {
        if (this.expandedGrid[i][j]) {
          if (this.expandedGrid[i][j] === 1) {
            ctx.fillStyle = '#000000';
            ctx.fillRect((j - pan.x) * blk + offset.x, (i - pan.y) * blk + offset.y, blk, blk);
          } else if (this.expandedGrid[i][j] === 2) {
            ctx.fillStyle = '#00FF00';
            ctx.fillRect((j - pan.x) * blk + offset.x, (i - pan.y) * blk + offset.y, blk, blk);
          }
        }
      }
    }
    // Draw player details
    let scaleFactor = this.sizeFactor;
    // Draw direction cone
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    // ctx.arc(player.x * scaleFactor, player.y * scaleFactor, maze.playerRadius * scaleFactor, player.direction - Math.PI/3, player.direction + Math.PI/3, false);
    ctx.arc(offset.x - this.playerRadius/2, offset.y - this.playerRadius/2, this.playerRadius * scaleFactor, player.direction - Math.PI/3, player.direction + Math.PI/3, false);
    ctx.fillStyle = '#009900';
    ctx.fill();

    // Draw player
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    //ctx.arc(player.x * scaleFactor, player.y * scaleFactor, maze.playerRadius, 0, Math.PI * 2, true);
    ctx.arc(offset.x - this.playerRadius/2, offset.y - this.playerRadius/2, this.playerRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#990000';
    ctx.fill();
  }

  check(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.mazeWidth - 1 || y < 0 || y > this.mazeHeight - 1) return 1;
    return this.expandedGrid[y][x];
  }

  // Divide (Recursive Division Method)
  divide(grid, x, y, width, height, orientation, rng) {
    //console.log(`Divide(grid,${x},${y},${width},${height},${orientation})`);
    if (width < 2 || height < 2) {
      return;
    }

    var wx = x + (orientation ? 0 : Math.floor(rng.float() * (width - 2)));
    var wy = y + (orientation ? Math.floor(rng.float() * (height - 2)) : 0);
    var px = wx + ((orientation) ? Math.floor(rng.float() * width) : 0);
    var py = wy + ((orientation) ? 0 : Math.floor(rng.float() * height));
    var dx = orientation ? 1 : 0;
    var dy = orientation ? 0 : 1;
    var len = orientation ? width : height;
    var dir = orientation ? 1 : 2; // South == 1, East == 2

    for (let i = 0; i < len; i++) {
      if (wy !== py || wx !== px) {
        grid[wy][wx] |= dir;
      }
      wx += dx;
      wy += dy;
    }

    var nx = x;
    var ny = y;
    var wd = orientation ? width : wx - x + 1;
    var ht = orientation ? wy - y + 1 : height;
    this.divide(grid, nx, ny, wd, ht, this.chooseOrientation(wd, ht, rng), rng);

    nx = orientation ? x : wx + 1;
    ny = orientation ? wy + 1 : y;
    wd = orientation ? width : x + width - wx - 1;
    ht = orientation ? y + height - wy - 1 : height;
    this.divide(grid, nx, ny, wd, ht, this.chooseOrientation(wd, ht, rng), rng);
  }

  chooseOrientation(width, height, rng) {
    return (width === height) ? Math.floor(rng.float() * 2) : (width < height) ? 1 : 0;
  }

  cast(point, angle, range) {
    var self = this;
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);
    var noWall = { length2: Infinity };

    return ray({ x: point.x, y: point.y, height: 0, distance: 0 });

    function get(x, y) {
      x = Math.floor(x);
      y = Math.floor(y);
      if (x < 0 || x > self.mazeWidth - 1 || y < 0 || y > self.mazeHeight - 1) return 1;
      return self.expandedGrid[y][x];
    }

    function ray(origin) {
      var stepX = step(sin, cos, origin.x, origin.y);
      var stepY = step(cos, sin, origin.y, origin.x, true);
      var nextStep = stepX.length2 < stepY.length2
        ? inspect(stepX, 1, 0, origin.distance, stepX.y)
        : inspect(stepY, 0, 1, origin.distance, stepY.x);

      if (nextStep.distance > range) return [origin];
      return [origin].concat(ray(nextStep));
    }

    function step(rise, run, x, y, inverted) {
      if (run === 0) {
        return noWall;
      }
      var dx = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
      var dy = dx * (rise / run);
      return {
        x: inverted ? y + dy : x + dx,
        y: inverted ? x + dx : y + dy,
        length2: dx * dx + dy * dy
      };
    }

    function inspect(step, shiftX, shiftY, distance, offset) {
      var dx = cos < 0 ? shiftX : 0;
      var dy = sin < 0 ? shiftY : 0;
      step.height = get(step.x - dx, step.y - dy);
      step.distance = distance + Math.sqrt(step.length2);
      if (shiftX) {
        step.shading = cos < 0 ? 2 : 0;
      } else {
        step.shading = sin < 0 ? 2 : 1;
      }
      step.offset = offset - Math.floor(offset);
      return step;
    }
  }
}
