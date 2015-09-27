var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SVG_1 = require('../../Helpers/SVG');
var Vector_1 = require('../../Helpers/Vector');
var Chunk_1 = require('../../VideoData/Chunk');
var Command_1 = require('../../VideoData/Command');
var Path_1 = require('../../Drawing/Path');
var Segments_1 = require('../../Drawing/Segments');
var Color_1 = require('../../UI/Color');
var Spline_1 = require('../../Helpers/Spline');
var TIME_PRECISION = 2;
var ChunkFactory = (function () {
    function ChunkFactory(next) {
        this.next = next;
    }
    ChunkFactory.prototype.FromSVG = function (events, node, cmdFactory) {
        if (!!this.next) {
            return this.next.FromSVG(events, node, cmdFactory);
        }
        throw new Error("Chunk loading failed: Unsupported node " + node.nodeName + ".");
    };
    ChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
        if (!!this.next) {
            return this.next.ToSVG(chunk, cmdFactory);
        }
        throw new Error("Chunk export failed: Unsupported command " + typeof (chunk) + ".");
    };
    ChunkFactory.prototype.CommandsToSVG = function (node, cmds, cmdFactory, chunkStart) {
        for (var i = 0; i < cmds.length; i++) {
            node.appendChild(cmdFactory.ToSVG(cmds[i], chunkStart));
        }
        return node;
    };
    ChunkFactory.GetCommands = function (cmd, cmdFactory, chunkStart) {
        var initCommands = this.initCmds.filter(function (v) { return v !== null; }).map(function (v) { return v.Clone(); });
        var cmds = [];
        while (!!cmd) {
            var loadedCmd = cmdFactory.FromSVG(cmd, chunkStart);
            cmds.push(loadedCmd);
            cmd = cmd.nextElementSibling;
            if (loadedCmd instanceof Command_1.MoveCursor) {
                this.initCmds[0] = loadedCmd;
            }
            else if (loadedCmd instanceof Command_1.ChangeBrushColor) {
                this.initCmds[1] = loadedCmd;
            }
            else if (loadedCmd instanceof Command_1.ChangeBrushSize) {
                this.initCmds[2] = loadedCmd;
            }
        }
        return [initCommands, cmds];
    };
    ChunkFactory.initCmds = [null, null, null];
    return ChunkFactory;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChunkFactory;
var VoidChunkFactory = (function (_super) {
    __extends(VoidChunkFactory, _super);
    function VoidChunkFactory() {
        _super.apply(this, arguments);
    }
    VoidChunkFactory.prototype.FromSVG = function (events, node, cmdFactory) {
        if (SVG_1.SVGA.attr(node, "type") === VoidChunkFactory.NodeName) {
            var chunk = new Chunk_1.VoidChunk(SVG_1.SVGA.numAttr(node, "t"), 0);
            _a = ChunkFactory.GetCommands(node.firstElementChild, cmdFactory, chunk.StartTime), chunk.InitCommands = _a[0], chunk.Commands = _a[1];
            return chunk;
        }
        return _super.prototype.FromSVG.call(this, events, node, cmdFactory);
        var _a;
    };
    VoidChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
        if (chunk instanceof Chunk_1.VoidChunk) {
            var node = SVG_1.default.CreateElement("g");
            SVG_1.SVGA.SetAttributes(node, {
                "type": VoidChunkFactory.NodeName,
                "t": chunk.StartTime.toFixed(TIME_PRECISION)
            });
            this.CommandsToSVG(node, chunk.Commands, cmdFactory, chunk.StartTime);
            return node;
        }
        return _super.prototype.ToSVG.call(this, chunk, cmdFactory);
    };
    VoidChunkFactory.NodeName = "void";
    return VoidChunkFactory;
})(ChunkFactory);
exports.VoidChunkFactory = VoidChunkFactory;
var InstructionType;
(function (InstructionType) {
    InstructionType[InstructionType["Move"] = 0] = "Move";
    InstructionType[InstructionType["Line"] = 1] = "Line";
    InstructionType[InstructionType["Curve"] = 2] = "Curve";
    InstructionType[InstructionType["Arc"] = 3] = "Arc";
    InstructionType[InstructionType["Close"] = 4] = "Close";
})(InstructionType || (InstructionType = {}));
var InstructionFactory = (function () {
    function InstructionFactory(letter, type, coordsCount, next) {
        this.letter = letter;
        this.type = type;
        this.coordsCount = coordsCount;
        this.next = next;
    }
    InstructionFactory.prototype.Create = function (c) {
        var letter = c.shift();
        if (letter === this.letter) {
            var coords = [];
            for (var i = 0; i < this.coordsCount; i++) {
                coords.push(this.CreateVector2(c.shift()));
            }
            return {
                type: this.type,
                coords: coords
            };
        }
        else {
            if (!!this.next) {
                c.unshift(letter);
                return this.next.Create(c);
            }
            throw new Error("Unsupported instruction letter '" + letter + "'");
        }
    };
    InstructionFactory.prototype.CreateVector2 = function (pair) {
        var coords = pair.split(",");
        if (coords.length !== 2) {
            throw new Error("Coordinates pair '" + pair + "' is not valid");
        }
        return new Vector_1.default(Number(coords[0]), Number(coords[1]));
    };
    return InstructionFactory;
})();
var ArcFactory = (function (_super) {
    __extends(ArcFactory, _super);
    function ArcFactory(next) {
        _super.call(this, "A", InstructionType.Arc, 3, next);
    }
    ArcFactory.prototype.Create = function (c) {
        var letter = c.shift();
        if (letter === this.letter) {
            var coords = [];
            coords.push(this.CreateVector2(c.shift()));
            c.shift();
            coords.push(this.CreateVector2(c.shift()));
            coords.push(this.CreateVector2(c.shift()));
            return {
                type: this.type,
                coords: coords
            };
        }
        else {
            if (!!this.next) {
                c.unshift(letter);
                return this.next.Create(c);
            }
            throw new Error("Unsupported instruction letter '" + letter + "'");
        }
    };
    return ArcFactory;
})(InstructionFactory);
var PathChunkFactory = (function (_super) {
    __extends(PathChunkFactory, _super);
    function PathChunkFactory(next) {
        _super.call(this, next);
        this.next = next;
        this.instructionFactory = new InstructionFactory("C", InstructionType.Curve, 3, new InstructionFactory("L", InstructionType.Line, 1, new InstructionFactory("M", InstructionType.Move, 1, new ArcFactory())));
    }
    PathChunkFactory.prototype.FromSVG = function (events, node, cmdFactory) {
        if (SVG_1.SVGA.attr(node, "type") === PathChunkFactory.NodeName) {
            if (node.childElementCount === 0) {
                throw new Error("Path chunk no child elements.");
            }
            var pathNode = node.firstElementChild;
            if (pathNode.localName !== "path") {
                throw new Error("Path chunk must begin with a <path> element, but " + pathNode.localName + " found instead");
            }
            var chunk = new Chunk_1.PathChunk(this.SVGNodeToPath(events, pathNode), SVG_1.SVGA.numAttr(node, "t"), 0);
            _a = ChunkFactory.GetCommands(pathNode.nextElementSibling, cmdFactory, chunk.StartTime), chunk.InitCommands = _a[0], chunk.Commands = _a[1];
            return chunk;
        }
        return _super.prototype.FromSVG.call(this, events, node, cmdFactory);
        var _a;
    };
    PathChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
        if (chunk instanceof Chunk_1.PathChunk) {
            var node = SVG_1.default.CreateElement("g");
            SVG_1.SVGA.SetAttributes(node, {
                "type": PathChunkFactory.NodeName,
                "t": chunk.StartTime.toFixed(TIME_PRECISION)
            });
            node.appendChild(this.PathToSVGNode(chunk.Path));
            this.CommandsToSVG(node, chunk.Commands, cmdFactory, chunk.StartTime);
            return node;
        }
        return _super.prototype.ToSVG.call(this, chunk, cmdFactory);
    };
    PathChunkFactory.prototype.SVGNodeToPath = function (events, node) {
        var color = SVG_1.default.attr(node, "fill");
        var path = new Path_1.default(events, true, color);
        var d = SVG_1.default.attr(node, "d");
        node = null;
        var c = d.split(" ").filter(function (val) { return val.length > 0; });
        var instructions = [];
        while (c.length > 0) {
            instructions.push(this.instructionFactory.Create(c));
        }
        c = null;
        d = null;
        var l = instructions.length - 1;
        if (instructions.length >= 2 && instructions[0].type === InstructionType.Move && instructions[l].type === InstructionType.Arc) {
            path.Segments.push(new Segments_1.ZeroLengthSegment(instructions[l - 1].coords[0], instructions[0].coords[0]));
            instructions.pop();
            instructions.pop();
            instructions.shift();
        }
        else {
            throw new Error("Only " + instructions.length + " valid instructions recognized in a path string");
        }
        if (instructions.length === 1) {
            var start = path.Segments[0].Right;
            var end = instructions[0].coords[2];
            path.Segments = [new Segments_1.ZeroLengthSegment(start, end)];
            return path;
        }
        l = instructions.length - 1;
        var prevSegment = path.Segments[0];
        for (var i = 0; i < Math.floor(instructions.length / 2); i++) {
            if (instructions[i].type === InstructionType.Line) {
                var qseg = new Segments_1.QuadrilateralSegment(instructions[i].coords[0], instructions[l - i].coords[0]);
                path.Segments.push(qseg);
                if (prevSegment instanceof Segments_1.CurvedSegment) {
                    prevSegment.Left = instructions[l - i].coords[0].clone();
                }
                prevSegment = qseg;
            }
            else if (instructions[i].type === InstructionType.Curve) {
                var right = new Spline_1.BezierCurveSegment(null, instructions[i].coords[0], instructions[i].coords[2], instructions[i].coords[1]);
                var left = new Spline_1.BezierCurveSegment(instructions[l - i].coords[2], instructions[l - i].coords[1], null, instructions[l - i].coords[0]);
                var seg = new Segments_1.CurvedSegment(left, right);
                if (!!prevSegment && prevSegment instanceof Segments_1.CurvedSegment) {
                    prevSegment.Left = seg.LeftBezier.Start.clone();
                    seg.RightBezier.Start = prevSegment.RightBezier.End.clone();
                }
                else if (!!prevSegment && prevSegment instanceof Segments_1.QuadrilateralSegment) {
                    seg.RightBezier.Start = prevSegment.Right.clone();
                }
                path.Segments.push(seg);
                prevSegment = seg;
            }
            else {
                throw new Error("Unsupported path segment type " + instructions[i].type + " ");
            }
        }
        if (!!prevSegment && prevSegment instanceof Segments_1.CurvedSegment) {
            prevSegment.Left = instructions[Math.floor(instructions.length / 2)].coords[2].clone();
        }
        return path;
    };
    PathChunkFactory.prototype.PathToSVGNode = function (path) {
        var segments = path.Segments;
        var seg = segments[0];
        var center = seg.Right.pointInBetween(seg.Left);
        var startDirection = seg.Left.clone().subtract(center);
        var endDirection = seg.Right.clone().subtract(center);
        var arc = SVG_1.default.ArcString(seg.Right, center.distanceTo(seg.Right), Path_1.default.angle(startDirection));
        var right = "";
        var left = " " + arc;
        for (var i = 0; i < segments.length; i++) {
            var seg = segments[i];
            if (seg instanceof Segments_1.ZeroLengthSegment) {
                right += SVG_1.default.MoveToString(seg.Right) + " ";
                left = SVG_1.default.MoveToString(seg.Left) + " " + left;
            }
            else if (seg instanceof Segments_1.CurvedSegment) {
                right += SVG_1.default.CurveToString(seg.RightBezier.StartCP, seg.RightBezier.EndCP, seg.RightBezier.End) + " ";
                left = SVG_1.default.CurveToString(seg.LeftBezier.EndCP, seg.LeftBezier.StartCP, seg.LeftBezier.Start) + " " + left;
            }
            else if (seg instanceof Segments_1.QuadrilateralSegment) {
                right += SVG_1.default.LineToString(seg.Right) + " ";
                left = SVG_1.default.LineToString(seg.Left) + " " + left;
            }
            else {
                throw new Error("Unsupported segment type " + typeof (seg));
            }
        }
        seg = segments[segments.length - 1];
        center = seg.Right.pointInBetween(seg.Left);
        startDirection = seg.Right.clone().subtract(center);
        endDirection = seg.Left.clone().subtract(center);
        var cap = SVG_1.default.ArcString(seg.Left, center.distanceTo(seg.Left), Path_1.default.angle(startDirection)) + " ";
        return SVG_1.default.CreateElement("path", {
            "fill": path.Color,
            "d": right + cap + left
        });
    };
    PathChunkFactory.NodeName = "path";
    return PathChunkFactory;
})(ChunkFactory);
exports.PathChunkFactory = PathChunkFactory;
var EraseChunkFactory = (function (_super) {
    __extends(EraseChunkFactory, _super);
    function EraseChunkFactory() {
        _super.apply(this, arguments);
        this.Width = 0;
        this.Height = 0;
    }
    EraseChunkFactory.prototype.FromSVG = function (events, node, cmdFactory) {
        if (SVG_1.SVGA.attr(node, "type") === EraseChunkFactory.NodeName) {
            if (node.childElementCount === 0) {
                throw new Error("Erase chunk no child elements.");
            }
            var rectNode = node.firstElementChild;
            if (rectNode.localName !== "rect") {
                throw new Error("Erase chunk must begin with a <rect> element, but " + rectNode.localName + " found instead");
            }
            var chunk = new Chunk_1.EraseChunk(new Color_1.default(SVG_1.default.attr(rectNode, "fill")), SVG_1.SVGA.numAttr(node, "t"), 0);
            _a = ChunkFactory.GetCommands(rectNode.nextElementSibling, cmdFactory, chunk.StartTime), chunk.InitCommands = _a[0], chunk.Commands = _a[1];
            return chunk;
        }
        return _super.prototype.FromSVG.call(this, events, node, cmdFactory);
        var _a;
    };
    EraseChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
        if (chunk instanceof Chunk_1.EraseChunk) {
            var node = SVG_1.default.CreateElement("g");
            SVG_1.SVGA.SetAttributes(node, {
                "type": EraseChunkFactory.NodeName,
                "t": chunk.StartTime.toFixed(TIME_PRECISION)
            });
            node.appendChild(SVG_1.default.CreateElement("rect", { "fill": chunk.Color.CssValue, width: this.Width, height: this.Height }));
            this.CommandsToSVG(node, chunk.Commands, cmdFactory, chunk.StartTime);
            return node;
        }
        return _super.prototype.ToSVG.call(this, chunk, cmdFactory);
    };
    EraseChunkFactory.NodeName = "erase";
    return EraseChunkFactory;
})(ChunkFactory);
exports.EraseChunkFactory = EraseChunkFactory;
