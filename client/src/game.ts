/// <reference path="../types/phaser.d.ts"/>

namespace ArtGalleryGame {

    interface point {
        xPos: integer;
        yPos: integer;
    }
    
    var p: point = {
        xPos:100,
        yPos:100
    }

    interface polygon {
        point_1: point;
        point_2: point;
        point_3: point;
    }

    
    export class GalleryGame extends Phaser.Scene {

        graphics: Phaser.GameObjects.Graphics | null = null;
        polygons: polygon[] | null = null;
        width: integer
        height: integer

        constructor() {
            super("GalleryGame");
        }

        drawPolygons(graphics: Phaser.GameObjects.Graphics) {

        }
        private uniform (high, low) {
            return Math.random() * (high-low) + low;
        }

        private randomAngleSteps(steps: integer, irregularity: number) {
            var angles:number[] = [];

            var lower = (2 * Math.PI / steps) - irregularity;
            var upper = (2 * Math.PI / steps) + irregularity;
            var cumSum = 0;
            for (var i = 0; i < steps; i++) {
                var angle = this.uniform(lower, upper);
                angles.push(angle);
                cumSum += angle;
            }

            cumSum /= (2 * Math.PI);
            for(var i = 0; i < steps; i++) {
                angles[i] /= cumSum;
            }

            return angles;
        }

        private clip(value:number, lower:number, upper:number) {
            return Math.min(upper, Math.max(value, lower));
        }

        private gauss(mu:number = 0, sigma:number = 1) {
            var u = 1 - Math.random();
            var v = 1 - Math.random();
            return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * sigma + mu;
        }

        private generatePolygon(
            center: point,
            averageRadius: integer,
            irregularity: integer, 
            spikiness: integer, 
            numVertices: integer,) {
            if (irregularity < 0 || irregularity > 1) 
                throw new RangeError("Irregularity must be between 0 and 1")
            if (spikiness < 0 || spikiness > 1) 
                throw new RangeError("Irregularity must be between 0 and 1")

            irregularity *= 2 * Math.PI / numVertices;
            spikiness *= averageRadius;
            var angleSteps:number[] = this.randomAngleSteps(numVertices, irregularity);
            var points: point[] = [];
            var angle:number = this.uniform(2*Math.PI, 0);

            for (var i = 0; i < numVertices; i++) {
                var radius:number = this.clip(this.gauss(averageRadius, spikiness), 0, 2 * averageRadius);
                var point:point = {
                    xPos:(center.xPos + radius * Math.cos(angle)), 
                    yPos:(center.yPos + radius * Math.sin(angle))};
                points.push(point);
                angle += angleSteps[i];
            }

            return points;
        }

        create() {
            this.graphics = this.add.graphics();
            this.graphics.lineStyle(5, 0x0, 1.0);
            /* Initialize values for polygons */
            
            var vertices = this.generatePolygon({xPos:250, yPos:250}, 100, 0.8, 0.6, 16);

            this.graphics.beginPath();
            for (const point of vertices) {
                this.graphics.lineTo(point.xPos, point.yPos);
            }

            this.graphics.closePath();
            this.graphics.strokePath();
        }


    }

}

var game = new Phaser.Game(
    {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: 0xEDEADE,
        scene: ArtGalleryGame.GalleryGame
    }
);