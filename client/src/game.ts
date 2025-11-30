/// <reference path="../types/phaser.d.ts"/>

import { makeDraggable } from './draggable.js';
namespace ArtGalleryGame {

    interface point {
        xPos: integer;
        yPos: integer;
    }

    var p: point = {
        xPos: 100,
        yPos: 100
    }

    interface polygon {
        point_1: point;
        point_2: point;
        point_3: point;
    }

    export const GamePhysics: Phaser.Types.Core.PhysicsConfig = {
        default: 'matter',
        /*
        arcade:{
            debug: true,
            debugShowBody: true,
            debugBodyColor: 0x008000
        }
        */

        matter: {
            debug: {
                showCollisions: false,
                showInternalEdges: false
            }
        }

    }


    export class GalleryGame extends Phaser.Scene {

        graphics: Phaser.GameObjects.Graphics | null = null;
        polygons: polygon[] | null = null;
        width: integer;
        height: integer;
        borders: Phaser.Physics.Arcade.StaticGroup;

        constructor(width, height) {
            super("GalleryGame");
            this.width = width;
            this.height = height;
        }

        private uniform(high, low) {
            return Math.random() * (high - low) + low;
        }

        private randomAngleSteps(steps: integer, irregularity: number) {
            var angles: number[] = [];

            var lower = (2 * Math.PI / steps) - irregularity;
            var upper = (2 * Math.PI / steps) + irregularity;
            var cumSum = 0;
            for (var i = 0; i < steps; i++) {
                var angle = this.uniform(lower, upper);
                angles.push(angle);
                cumSum += angle;
            }

            cumSum /= (2 * Math.PI);
            for (var i = 0; i < steps; i++) {
                angles[i] /= cumSum;
            }

            return angles;
        }

        private clip(value: number, lower: number, upper: number) {
            return Math.min(upper, Math.max(value, lower));
        }

        private gauss(mu: number = 0, sigma: number = 1) {
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
                throw new RangeError("Spikiness must be between 0 and 1")

            irregularity *= 2 * Math.PI / numVertices;
            spikiness *= averageRadius;
            var angleSteps: number[] = this.randomAngleSteps(numVertices, irregularity);
            var points: point[] = [];
            var angle: number = this.uniform(0, 2 * Math.PI);

            for (var i = 0; i < numVertices; i++) {
                var radius: number = this.clip(this.gauss(averageRadius, spikiness), 0, 2 * averageRadius);
                var point: point = {
                    xPos: (center.xPos + radius * Math.cos(angle)),
                    yPos: (center.yPos + radius * Math.sin(angle))
                };
                points.push(point);
                angle += angleSteps[i];
            }

            return points;
        }

        private addPolygonPhysics(points: point[]) {
            const body:MatterJS.BodyType[] = [];
            points.push(points[0]);
            for (var i = 1; i < points.length; i++) {
                const x1 = points[i - 1].xPos;
                const y1 = points[i - 1].yPos;
                const x2 = points[i].xPos;
                const y2 = points[i].yPos;

                const dx = x2 - x1;
                const dy = y2 - y1;

                console.debug(`points : (${x1}, ${y1}), (${x2}, ${y2})`);
                const len = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                console.debug(`Length : ${len}`);
                const angle = Math.atan(dy / dx);

                const midPoint:point = {
                    xPos: (x2 + x1) / 2,
                    yPos: (y2 + y1) / 2
                }

                const linePhys = this.matter.add.rectangle(
                    midPoint.xPos,
                    midPoint.yPos,
                    len,
                    1,
                    { isStatic: true });
                this.matter.body.setAngle(linePhys, angle);
                body.push(linePhys);
            }

        }

        private drawDebugMarkers(points: point[]) {
            for (var p of points) {
                console.log(`Drawing marker at: (${p.xPos}, ${p.yPos})`);
                const pointMarker = this.add.circle(p.xPos, p.yPos, 3, 0xffffff, 1);
                pointMarker.setStrokeStyle(1, 0x000000);
            }
        }

        private renderPolygon(graphics: Phaser.GameObjects.Graphics, points: point[]) {
            graphics.lineStyle(2, 0xFF0000, 1.0);
            if (points.length > 0) {
                graphics.moveTo(points[0].xPos, points[0].yPos);
                for (var i = 0; i < points.length; i++) {
                    graphics.lineTo(points[i].xPos, points[i].yPos);
                }
            }
        }

        create() {

            const xOffset = this.width / 2;
            const yOffset = this.height / 2;

            this.graphics = this.add.graphics();
            this.graphics.lineStyle(5, 0x0, 1.0);
            /* Initialize values for polygons */
            this.graphics.beginPath();

            //this.borders = this.physics.add.staticGroup();

            var circle = this.add.circle(100, 100, 10, 0x00FFFF);
            makeDraggable(circle, true);

            var points = this.generatePolygon({ xPos: xOffset, yPos: yOffset }, 175, 0.8, 0.3, 16);

            /* Ideal polygon :  */
            this.renderPolygon(this.graphics, points);
            var polygonPhysics = this.addPolygonPhysics(points);

            this.drawDebugMarkers(points);

            this.graphics.closePath();
            this.graphics.strokePath();
        }


    }

}

var game = new Phaser.Game(
    {
        type: Phaser.AUTO,
        dom: { createContainer: true },
        parent: "game-wrapper",
        width: 800,
        height: 600,
        backgroundColor: 0xEDEADE,
        physics: ArtGalleryGame.GamePhysics,
        scene: new ArtGalleryGame.GalleryGame(800, 600)
    }
);