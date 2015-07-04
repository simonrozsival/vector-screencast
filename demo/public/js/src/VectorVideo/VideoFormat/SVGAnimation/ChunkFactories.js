/// <reference path="../../VideoData/Chunk" />
/// <reference path="../../VideoData/Command" />
/// <reference path="CommandFactories" />
/// <reference path="../../Helpers/SVG" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VideoFormat;
(function (VideoFormat) {
    var SVGAnimation;
    (function (SVGAnimation) {
        var SVG = Helpers.SVG;
        var SVGA = Helpers.SVGA;
        var VoidChunk = VideoData.VoidChunk;
        var PathChunk = VideoData.PathChunk;
        var EraseChunk = VideoData.EraseChunk;
        /** Time is in miliseconds */
        var TIME_PRECISION = 2;
        /**
         * Chunk factories - implementing the chain of responsibility design pattern
         */
        var ChunkFactory = (function () {
            function ChunkFactory(next) {
                this.next = next;
            }
            ChunkFactory.prototype.FromSVG = function (node, cmdFactory) {
                if (!!this.next) {
                    return this.next.FromSVG(node, cmdFactory);
                }
                throw new Error("Chunk loading failed: Unsupported node " + node.nodeName + ".");
            };
            ChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
                if (!!this.next) {
                    return this.next.ToSVG(chunk, cmdFactory);
                }
                throw new Error("Chunk export failed: Unsupported command " + typeof (chunk) + ".");
            };
            Object.defineProperty(ChunkFactory.prototype, "InitCommandsNodeName", {
                get: function () { return "init"; },
                enumerable: true,
                configurable: true
            });
            ChunkFactory.prototype.InitCommandsFromSVG = function (node, cmdFactory) {
                if (node.localName === this.InitCommandsNodeName) {
                    var cmds = [];
                    for (var i = 0; i < node.childNodes.length; i++) {
                        cmds.push(cmdFactory.FromSVG(node.childNodes.item(i)));
                    }
                    return cmds;
                }
                throw new Error("Can't read init commonds from " + node.nodeName);
            };
            ChunkFactory.prototype.InitCommandsToSVG = function (cmds, cmdFactory) {
                var node = SVGA.CreateElement(this.InitCommandsNodeName);
                return this.CommandsToSVG(node, cmds, cmdFactory);
            };
            ChunkFactory.prototype.CommandsToSVG = function (node, cmds, cmdFactory) {
                for (var i = 0; i < cmds.length; i++) {
                    node.appendChild(cmdFactory.ToSVG(cmds[i]));
                }
                return node;
            };
            return ChunkFactory;
        })();
        SVGAnimation.ChunkFactory = ChunkFactory;
        var VoidChunkFactory = (function (_super) {
            __extends(VoidChunkFactory, _super);
            function VoidChunkFactory() {
                _super.apply(this, arguments);
            }
            VoidChunkFactory.prototype.FromSVG = function (node, cmdFactory) {
                if (SVGA.attr(node, "type") === VoidChunkFactory.NodeName) {
                    var chunk = new VoidChunk(SVGA.numAttr(node, "t"), SVGA.numAttr(node, "lastErase"));
                    for (var i = 0; i < node.childNodes.length; i++) {
                        var el = node.childNodes[i];
                        chunk.PushCommand(cmdFactory.FromSVG(el));
                    }
                    return chunk;
                }
                return _super.prototype.FromSVG.call(this, node, cmdFactory);
            };
            VoidChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
                if (chunk instanceof VoidChunk) {
                    var node = SVG.CreateElement("g");
                    SVGA.SetAttributes(node, {
                        "type": VoidChunkFactory.NodeName,
                        "t": chunk.StartTime.toFixed(TIME_PRECISION),
                        "lastErase": chunk.LastErase
                    });
                    node.appendChild(this.InitCommandsToSVG(chunk.InitCommands, cmdFactory));
                    this.CommandsToSVG(node, chunk.Commands, cmdFactory);
                    return node;
                }
                return _super.prototype.ToSVG.call(this, chunk, cmdFactory);
            };
            VoidChunkFactory.NodeName = "void";
            return VoidChunkFactory;
        })(ChunkFactory);
        SVGAnimation.VoidChunkFactory = VoidChunkFactory;
        var InstructionType;
        (function (InstructionType) {
            InstructionType[InstructionType["Move"] = 0] = "Move";
            InstructionType[InstructionType["Line"] = 1] = "Line";
            InstructionType[InstructionType["Curve"] = 2] = "Curve";
            InstructionType[InstructionType["Arc"] = 3] = "Arc";
            InstructionType[InstructionType["Close"] = 4] = "Close";
        })(InstructionType || (InstructionType = {}));
        var PathChunkFactory = (function (_super) {
            __extends(PathChunkFactory, _super);
            function PathChunkFactory() {
                _super.apply(this, arguments);
            }
            PathChunkFactory.prototype.FromSVG = function (node, cmdFactory) {
                if (SVGA.attr(node, "type") === PathChunkFactory.NodeName) {
                    // [0] path chunk must have at least two child nodes
                    if (node.childNodes.length < 2) {
                        throw new Error("Path chunk has only " + node.childNodes.length + " nodes.");
                    }
                    // [1] first child must be a PATH
                    var pathNode = node.childNodes.item(0);
                    if (pathNode.localName !== "path") {
                        throw new Error("Path chunk must begin with a <path> element, but " + pathNode.localName + " found instead");
                    }
                    // [2] second node must be init commands container
                    var init = node.childNodes.item(1);
                    if (init.localName !== this.InitCommandsNodeName) {
                        throw new Error("Second child of chunk must be an <init> element, but " + init.localName + " found instead");
                    }
                    var initCmds = this.InitCommandsFromSVG(init, cmdFactory);
                    // now the chunk instance can be created
                    var chunk = new PathChunk(this.SVGNodeToPath(pathNode), SVGA.numAttr(node, "t"), SVGA.numAttr(node, "lastErase"));
                    chunk.InitCommands = initCmds;
                    // [3 ..] all the others are cmds
                    for (var i = 2; i < node.childNodes.length; i++) {
                        var el = node.childNodes[i];
                        chunk.PushCommand(cmdFactory.FromSVG(el));
                    }
                    return chunk;
                }
                return _super.prototype.FromSVG.call(this, node, cmdFactory);
            };
            PathChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
                if (chunk instanceof PathChunk) {
                    var node = SVG.CreateElement("g");
                    SVGA.SetAttributes(node, {
                        "type": PathChunkFactory.NodeName,
                        "t": chunk.StartTime.toFixed(TIME_PRECISION),
                        "lastErase": chunk.LastErase
                    });
                    // [1] path
                    node.appendChild(this.PathToSVGNode(chunk.Path));
                    // [2] init commands
                    node.appendChild(this.InitCommandsToSVG(chunk.InitCommands, cmdFactory));
                    // [3] all the commands
                    this.CommandsToSVG(node, chunk.Commands, cmdFactory);
                    return node;
                }
                return _super.prototype.ToSVG.call(this, chunk, cmdFactory);
            };
            /**
             * Deserilize path from an SVG "path" node
             */
            PathChunkFactory.prototype.SVGNodeToPath = function (node) {
                var color = SVG.attr(node, "fill");
                var path = new Drawing.Path(true, color); // curved = true/false doesn't make any difference - the data are already recorded  
                // convert path data to sequence of segments 
                var d = SVG.attr(node, "d");
                node = null; // I don't need this reference any more
                var c = d.split(" ");
                var instructions = [];
                // create list of instructions
                for (var i = 0; i < c.length; i++) {
                    switch (c[i]) {
                        case "Z":
                            // instead of 'instructions.push({ type: InstructionType.Close, coords: [] });' just skip it
                            i += 1;
                            break;
                        case "M":
                            instructions.push({ type: InstructionType.Move, coords: [this.CreateVector2(c[i + 1])] });
                            i += 2;
                            break;
                        case "L":
                            instructions.push({ type: InstructionType.Line, coords: [this.CreateVector2(c[i + 1])] });
                            i += 2;
                            break;
                        case "C":
                            instructions.push({ type: InstructionType.Curve, coords: [this.CreateVector2(c[i + 1]), this.CreateVector2(c[i + 2]), this.CreateVector2(c[i + 3])] });
                            i += 4;
                        case "A":
                            // instead of 'instructions.push({ type: InstructionType.Arc, coords: [this.CreateVector2(c[i + 1]), this.CreateVector2(c[i + 2]), this.CreateVector2(c[i + 3])]  });' just skip it
                            i += 4;
                            break;
                        default:
                            throw new Error("Unsupported instruction " + c[i]);
                    }
                }
                c = null; // drop reference
                d = null;
                // first segment - zero length segment
                var l = instructions.length - 1;
                if (instructions.length >= 2 && instructions[0].type === InstructionType.Move && instructions[l].type === InstructionType.Line) {
                    path.Segments.push(new Drawing.ZeroLengthSegment(instructions[l - 1].coords[0], instructions[0].coords[0]));
                    instructions.pop();
                    instructions.shift();
                }
                else {
                    throw new Error("Only " + instructions.length + " valid instructions recognized in a path string");
                }
                // left and right parts are at the same distance from the ends of the path
                l = instructions.length;
                console.log(instructions);
                for (var i = 0; i < instructions.length / 2; i++) {
                    if (instructions[i].type === InstructionType.Line) {
                        path.Segments.push(new Drawing.QuadrilateralSegment(instructions[i].coords[0], instructions[l - i].coords[0]));
                    }
                    else if (instructions[i].type === InstructionType.Curve) {
                        var left = new Helpers.BezierCurveSegment(null, instructions[i].coords[0], instructions[i].coords[1], instructions[i].coords[2]);
                        var right = new Helpers.BezierCurveSegment(instructions[l - i].coords[3], instructions[l - i].coords[2], instructions[l - i].coords[1], null);
                        path.Segments.push(new Drawing.CurvedSegment(left, right));
                    }
                    else {
                        throw new Error("Unsupported path segment type " + instructions[i].type + " ");
                    }
                }
                return path;
            };
            PathChunkFactory.prototype.CreateVector2 = function (pair) {
                var coords = pair.split(",");
                if (coords.length !== 2) {
                    throw new Error("Coordinates pair '" + pair + "' is not valid");
                }
                return new Helpers.Vector2(Number(coords[0]), Number(coords[0]));
            };
            /**
             * Encode path into a SVG "path" element
             */
            PathChunkFactory.prototype.PathToSVGNode = function (path) {
                var d = "";
                if (path instanceof Drawing.SvgPath) {
                    d = path.GetPathString();
                }
                else {
                    var segments = path.Segments;
                    // arc cap at the start
                    var seg = segments[0];
                    var center = seg.Right.add(seg.Left).scale(0.5);
                    var startDirection = seg.Left.subtract(center);
                    var endDirection = seg.Right.subtract(center);
                    var arc = SVG.ArcString(seg.Right, center.distanceTo(seg.Right), Drawing.Path.angle(startDirection));
                    var right = SVG.MoveToString(segments[0].Right);
                    var left = SVG.LineToString(segments[0].Left) + " " + arc;
                    for (var i = 0; i < segments.length - 1; i++) {
                        var seg = segments[i];
                        if (seg instanceof Drawing.CurvedSegment) {
                            right += SVG.CurveToString(seg.RightBezier.StartCP, seg.RightBezier.EndCP, seg.RightBezier.End) + " "; // SPACE divider
                            left = SVG.CurveToString(seg.LeftBezier.EndCP, seg.LeftBezier.StartCP, seg.LeftBezier.Start) + " " + left; // SPACE divider
                        }
                        else if (seg instanceof Drawing.QuadrilateralSegment) {
                            right += SVG.LineToString(seg.Right) + " "; // SPACE divider
                            left = SVG.LineToString(seg.Left) + " " + left; // SPACE divider
                        }
                        else {
                            throw new Error("Unsupported segment type " + typeof (seg));
                        }
                    }
                    // arc cap at the end
                    seg = segments[segments.length - 1];
                    center = seg.Right.add(seg.Left).scale(0.5);
                    startDirection = seg.Right.subtract(center);
                    endDirection = seg.Left.subtract(center);
                    var cap = SVG.ArcString(seg.Left, center.distanceTo(seg.Left), Drawing.Path.angle(startDirection)) + " ";
                    d = right + cap + left;
                }
                return SVG.CreateElement("path", {
                    "fill": path.Color,
                    "d": d
                });
            };
            PathChunkFactory.NodeName = "path";
            return PathChunkFactory;
        })(ChunkFactory);
        SVGAnimation.PathChunkFactory = PathChunkFactory;
        var EraseChunkFactory = (function (_super) {
            __extends(EraseChunkFactory, _super);
            function EraseChunkFactory() {
                _super.apply(this, arguments);
            }
            EraseChunkFactory.prototype.FromSVG = function (node, cmdFactory) {
                if (SVGA.attr(node, "type") === EraseChunkFactory.NodeName) {
                    // [0] erase chunk must have at least two child nodes
                    if (node.childNodes.length < 2) {
                        throw new Error("Erase chunk has only " + node.childNodes.length + " nodes.");
                    }
                    // [1] first child must be a PATH
                    var rectNode = node.childNodes.item(0);
                    if (rectNode.localName !== "rect") {
                        throw new Error("Erase chunk must begin with a <rect> element, but " + rectNode.localName + " found instead");
                    }
                    // [2] second node must be init commands container
                    var init = node.childNodes.item(1);
                    if (init.localName !== this.InitCommandsNodeName) {
                        throw new Error("Second child of chunk must be an <init> element, but " + init.localName + " found instead");
                    }
                    var initCmds = this.InitCommandsFromSVG(init, cmdFactory);
                    // now the chunk instance can be created
                    var chunk = new EraseChunk(new UI.Color("", SVG.attr(rectNode, "fill")), SVGA.numAttr(node, "t"), SVGA.numAttr(node, "lastErase"));
                    chunk.InitCommands = initCmds;
                    return chunk;
                }
                return _super.prototype.FromSVG.call(this, node, cmdFactory);
            };
            EraseChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
                if (chunk instanceof EraseChunk) {
                    var node = SVG.CreateElement("g");
                    SVGA.SetAttributes(node, {
                        "type": EraseChunkFactory.NodeName,
                        "t": chunk.StartTime.toFixed(TIME_PRECISION),
                        "lastErase": chunk.LastErase
                    });
                    // [1] rect
                    node.appendChild(SVG.CreateElement("rect", { "fill": chunk.Color.CssValue, width: "100%", height: "100%" }));
                    // [2] init commands
                    node.appendChild(this.InitCommandsToSVG(chunk.InitCommands, cmdFactory));
                    return node;
                }
                return _super.prototype.ToSVG.call(this, chunk, cmdFactory);
            };
            EraseChunkFactory.NodeName = "erase";
            return EraseChunkFactory;
        })(ChunkFactory);
        SVGAnimation.EraseChunkFactory = EraseChunkFactory;
    })(SVGAnimation = VideoFormat.SVGAnimation || (VideoFormat.SVGAnimation = {}));
})(VideoFormat || (VideoFormat = {}));
