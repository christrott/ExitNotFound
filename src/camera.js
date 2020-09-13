/*
 *  Copied and then modified from the raycaster demo here:
 *  https://github.com/hunterloftis/playfuljs-demos/blob/gh-pages/raycaster/index.html
 */

module.exports = class Camera {
    constructor(canvas, resolution, focalLength) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth * 0.8;
        this.height = canvas.height = window.innerHeight * 0.8;
        this.resolution = resolution;
        this.spacing = canvas.width / resolution;
        this.focalLength = focalLength || 0.8;
        this.range = 14;
        this.lightRange = 15;
        this.scale = (this.width + this.height) / 1200;
        this.skyboxImage = null;
    }

    render(player, map) {
        this.drawSky(this.ctx, this.canvas.width, this.canvas.height);
        this.drawColumns(player, map);
    }

    drawColumns(player, map) {
        this.ctx.save();
        for (var column = 0; column < this.resolution; column++) {
            var x = column / this.resolution - 0.5;
            var angle = Math.atan2(x, this.focalLength);
            var ray = map.cast(player, player.direction + angle, this.range);
            this.drawColumn(column, ray, angle, map);
        }
        this.ctx.restore();
    }

    drawColumn(column, ray, angle, map) {
        var ctx = this.ctx;
        var texture = map.wallTexture;
        var exitTexture = map.exitTexture;
        var left = Math.floor(column * this.spacing);
        var width = Math.ceil(this.spacing);
        var hit = -1;

        while (++hit < ray.length && ray[hit].height <= 0);

        for (var s = ray.length - 1; s >= 0; s--) {
            var step = ray[s];

            if (s === hit) {
                var textureX = Math.floor(texture.width * step.offset);
                var wall = this.project(step.height, angle, step.distance);

                ctx.globalAlpha = 1;
                if (wall.type === 'Wall') {
                    ctx.drawImage(texture.image, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);
                } else if (wall.type === 'Exit') {
                    ctx.drawImage(exitTexture.image, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);
                }
                ctx.fillStyle = '#000000';
                ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
                ctx.fillRect(left, wall.top, width, wall.height);
            }
        }
    }

    project(height, angle, distance) {
        var z = distance * Math.cos(angle);
        var wallHeight = (height === 2) ? this.height * 1 / z : this.height * height / z;
        var bottom = this.height / 2 * (1 + 1 / z);
        return {
            top: bottom - wallHeight,
            height: wallHeight,
            type: (height === 2) ? 'Exit' : 'Wall'
        };
    };

    generateSky(ctx, noise) {
        this.skyboxImage = ctx.createImageData(this.canvas.width, this.canvas.height);
        var data = this.skyboxImage.data;
        for (var x = 0; x < this.canvas.width; x++) {
            for (var y = 0; y < this.canvas.height; y++) {
                var value = Math.abs(noise.perlin2(x / 100, y / 50));
                value *= 25;
                var cell = (x + y * this.canvas.width) * 4;
                data[cell] = data[cell + 1] = data[cell + 2] = value;
                data[cell] += Math.max(0, (25 - value) * 2);
                data[cell + 3] = 255; // Alpha value
            }
        }
    }

    drawSky(ctx, width, height) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 100, 50);
        ctx.putImageData(this.skyboxImage, 0, 0);
        ctx.fillStyle = '#21130A';
        ctx.fillRect(0, height * 0.5, width, height * 0.5);
    }
}
