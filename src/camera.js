module.exports = function camera(canvas, resolution, focalLength) {
    var cameraObj = {
        ctx: canvas.getContext('2d'),
        width: canvas.width = window.innerWidth * 0.8,
        height: canvas.height = window.innerHeight * 0.8,
        resolution: resolution,
        spacing: canvas.width / resolution,
        focalLength: focalLength || 0.8,
        range: 14, //MOBILE ? 8 : 14,
        lightRange: 15,
        scale: (this.width + this.height) / 1200,
    }

    cameraObj.render = function (player, map) {
        // this.drawSky(player.direction, map.skybox, map.light);
        this.drawColumns(player, map);
    };

    cameraObj.drawColumns = function (player, map) {
        this.ctx.save();
        for (var column = 0; column < this.resolution; column++) {
            var x = column / this.resolution - 0.5;
            var angle = Math.atan2(x, this.focalLength);
            var ray = map.cast(player, player.direction + angle, this.range);
            this.drawColumn(column, ray, angle, map);
        }
        this.ctx.restore();
    };

    cameraObj.drawColumn = function (column, ray, angle, map) {
        var ctx = this.ctx;
        var texture = map.wallTexture;
        var exitTexture = map.exitTexture;
        var left = Math.floor(column * this.spacing);
        var width = Math.ceil(this.spacing);
        var hit = -1;

        while (++hit < ray.length && ray[hit].height <= 0);

        for (var s = ray.length - 1; s >= 0; s--) {
            var step = ray[s];
            //var rainDrops = Math.pow(Math.random(), 3) * s;
            //var rain = (rainDrops > 0) && this.project(0.1, angle, step.distance);

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
    };

    cameraObj.project = function (height, angle, distance) {
        var z = distance * Math.cos(angle);
        var wallHeight = (height === 2) ? this.height * 1 / z : this.height * height / z;
        var bottom = this.height / 2 * (1 + 1 / z);
        return {
            top: bottom - wallHeight,
            height: wallHeight,
            type: (height === 2) ? 'Exit' : 'Wall'
        };
    };

    cameraObj.drawSky = function (direction, sky, ambient) {
        var width = sky.width * (this.height / sky.height) * 2;
        var left = (direction / (Math.PI*2)) * -width;

        this.ctx.save();
        this.ctx.drawImage(sky.image, left, 0, width, this.height);
        if (left < width - this.width) {
            this.ctx.drawImage(sky.image, left + width, 0, width, this.height);
        }
        if (ambient > 0) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = ambient * 0.1;
            this.ctx.fillRect(0, this.height * 0.5, this.width, this.height * 0.5);
        }
        this.ctx.restore();
    };
    return cameraObj;
}