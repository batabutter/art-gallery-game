/// <reference path="../types/phaser.d.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { makeDraggable } from './draggable.js';
var ArtGalleryGame;
(function (ArtGalleryGame) {
    var p = {
        xPos: 100,
        yPos: 100
    };
    ArtGalleryGame.GamePhysics = {
        default: 'matter',
        matter: {
            debug: {
                showCollisions: true,
                showBounds: true,
                showInternalEdges: true
            }
        }
    };
    var GalleryGame = /** @class */ (function (_super) {
        __extends(GalleryGame, _super);
        function GalleryGame() {
            var _this = _super.call(this, "GalleryGame") || this;
            _this.graphics = null;
            _this.polygons = null;
            _this.width = 800;
            _this.height = 600;
            return _this;
        }
        GalleryGame.prototype.drawPolygons = function (graphics) {
        };
        GalleryGame.prototype.uniform = function (high, low) {
            return Math.random() * (high - low) + low;
        };
        GalleryGame.prototype.randomAngleSteps = function (steps, irregularity) {
            var angles = [];
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
        };
        GalleryGame.prototype.clip = function (value, lower, upper) {
            return Math.min(upper, Math.max(value, lower));
        };
        GalleryGame.prototype.gauss = function (mu, sigma) {
            if (mu === void 0) { mu = 0; }
            if (sigma === void 0) { sigma = 1; }
            var u = 1 - Math.random();
            var v = 1 - Math.random();
            return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * sigma + mu;
        };
        GalleryGame.prototype.generatePolygon = function (center, averageRadius, irregularity, spikiness, numVertices) {
            if (irregularity < 0 || irregularity > 1)
                throw new RangeError("Irregularity must be between 0 and 1");
            if (spikiness < 0 || spikiness > 1)
                throw new RangeError("Spikiness must be between 0 and 1");
            irregularity *= 2 * Math.PI / numVertices;
            spikiness *= averageRadius;
            var angleSteps = this.randomAngleSteps(numVertices, irregularity);
            var points = [];
            var angle = this.uniform(0, 2 * Math.PI);
            for (var i = 0; i < numVertices; i++) {
                var radius = this.clip(this.gauss(averageRadius, spikiness), 0, 2 * averageRadius);
                var point = {
                    xPos: (center.xPos + radius * Math.cos(angle)),
                    yPos: (center.yPos + radius * Math.sin(angle))
                };
                points.push(point);
                angle += angleSteps[i];
            }
            return points;
        };
        GalleryGame.prototype.addPhysicsLine = function (point, xOffset, yOffset) {
            // What the fuck
            var line = this.add.line(xOffset, yOffset, 0, 0, point.xPos, point.yPos);
        };
        GalleryGame.prototype.drawPolygonBounds = function (points) {
            var bounds = [];
            if (points.length > 0) {
                var start = points[0];
                for (var i = 1; i < points.length; i++) {
                    var line = this.add.line(0, 0, points[i - 1].xPos, points[i - 1].yPos, points[i].xPos, points[i].yPos, 0x000000).setOrigin(0, 0);
                    bounds.push(line);
                }
                bounds.push(this.add.line(0, 0, points[points.length - 1].xPos, points[points.length - 1].yPos, start.xPos, start.yPos, 0x000000).setOrigin(0, 0));
            }
            else {
                throw new RangeError("Points list must be greater than 0.");
            }
            return bounds;
        };
        GalleryGame.prototype.drawDebugMarkers = function (points) {
            for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
                var p = points_1[_i];
                console.log("Drawing marker at: (".concat(p.xPos, ", ").concat(p.yPos, ")"));
                var pointMarker = this.add.circle(p.xPos, p.yPos, 3, 0xffffff, 1);
                pointMarker.setStrokeStyle(1, 0x000000);
            }
        };
        GalleryGame.prototype.create = function () {
            var xOffset = this.width / 2;
            var yOffset = this.height / 2;
            this.graphics = this.add.graphics();
            this.graphics.lineStyle(5, 0x0, 1.0);
            /* Initialize values for polygons */
            this.graphics.beginPath();
            //this.borders = this.physics.add.staticGroup();
            var circle = this.add.circle(100, 100, 10, 0x00FFFF);
            makeDraggable(circle, true);
            var points = this.generatePolygon({ xPos: xOffset, yPos: yOffset }, 175, 0.8, 0.3, 16);
            /* Ideal polygon :  */
            this.graphics.lineStyle(2, 0xFF0000, 1.0);
            console.debug(points);
            if (points.length > 0) {
                this.graphics.moveTo(points[0].xPos, points[0].yPos);
                for (var i = 0; i < points.length; i++) {
                    this.graphics.lineTo(points[i].xPos, points[i].yPos);
                }
            }
            var polygonBounds = this.drawPolygonBounds(points);
            this.drawDebugMarkers(points);
            this.graphics.closePath();
            this.graphics.strokePath();
        };
        return GalleryGame;
    }(Phaser.Scene));
    ArtGalleryGame.GalleryGame = GalleryGame;
})(ArtGalleryGame || (ArtGalleryGame = {}));
var game = new Phaser.Game({
    type: Phaser.AUTO,
    dom: { createContainer: true },
    parent: "game-wrapper",
    width: 800,
    height: 600,
    backgroundColor: 0xEDEADE,
    physics: ArtGalleryGame.GamePhysics,
    scene: ArtGalleryGame.GalleryGame
});
