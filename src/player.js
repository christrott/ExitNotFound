module.exports = class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.direction = 0;
        this.totalSteps = 0;
        this.exited = false;
    }

    move(moveStep, maze, grid) {
        var dx = Math.cos(this.direction) * moveStep;
        var dy = Math.sin(this.direction) * moveStep;
        // Check grid for collisions
        const checkX = maze.check(this.x + dx, this.y, grid);
        const checkY = maze.check(this.x, this.y + dy, grid);
        if (checkX === 0) {
            this.x += dx;
        }
        if (checkY === 0) {
            this.y += dy;
        }
        if (checkX === 2 || checkY === 2) {
            this.exited = true;
        }
        this.totalSteps += Math.abs(moveStep);
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.direction = 0;
        this.totalSteps = 0;
        this.exited = false;
    }

    rotate(angle) {
        this.direction = (this.direction + angle + (Math.PI * 2)) % (Math.PI * 2);
    }
}