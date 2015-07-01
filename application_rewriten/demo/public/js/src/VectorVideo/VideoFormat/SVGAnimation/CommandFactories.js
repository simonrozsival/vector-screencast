/// <reference path="../../Helpers/SVG" />
/// <reference path="../../VideoData/Command" />
/// <reference path="../../Helpers/HelperFunctions" />
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
        var MoveCursor = VideoData.MoveCursor;
        var ChangeBrushColor = VideoData.ChangeBrushColor;
        var ChangeBrushSize = VideoData.ChangeBrushSize;
        var ClearCanvas = VideoData.ClearCanvas;
        var DrawNextSegment = VideoData.DrawNextSegment;
        var SVGA = Helpers.SVGA;
        var precise = Helpers.precise;
        var TIME_PRECISION = 2;
        var COORDS_PRECISION = 3;
        var PRESSURE_PRECISION = 4;
        /**
         * CommandFactory is the basis of "Chain of responsibility" pattern implementation.
         * Derived classes are used to convert commands to or from SVG nodes.
         */
        var CommandFactory = (function () {
            function CommandFactory(next) {
                this.next = next;
            }
            CommandFactory.prototype.FromSVG = function (node) {
                if (!!this.next) {
                    return this.next.FromSVG(node);
                }
                throw new Error("Command loading failed: Unsupported node " + node.nodeName + ".");
            };
            CommandFactory.prototype.ToSVG = function (cmd) {
                if (!!this.next) {
                    return this.next.ToSVG(cmd);
                }
                throw new Error("Command export failed: Unsupported command " + typeof cmd + ".");
            };
            return CommandFactory;
        })();
        SVGAnimation.CommandFactory = CommandFactory;
        var MoveCursorFactory = (function (_super) {
            __extends(MoveCursorFactory, _super);
            function MoveCursorFactory() {
                _super.apply(this, arguments);
            }
            MoveCursorFactory.prototype.FromSVG = function (node) {
                if (node.localName === MoveCursorFactory.NodeName) {
                    return new MoveCursor(SVGA.numAttr(node, "x"), SVGA.numAttr(node, "y"), SVGA.numAttr(node, "p"), SVGA.numAttr(node, "t"));
                }
                // else pass through the chain of responsibility
                return _super.prototype.FromSVG.call(this, node);
            };
            MoveCursorFactory.prototype.ToSVG = function (cmd) {
                if (cmd instanceof MoveCursor) {
                    return SVGA.CreateElement(MoveCursorFactory.NodeName, {
                        "x": precise(cmd.X),
                        "y": precise(cmd.Y),
                        "p": precise(cmd.P, PRESSURE_PRECISION),
                        "t": precise(cmd.Time, TIME_PRECISION)
                    });
                }
                // else pass through the chain of responsibility
                return _super.prototype.ToSVG.call(this, cmd);
            };
            MoveCursorFactory.NodeName = "m";
            return MoveCursorFactory;
        })(CommandFactory);
        SVGAnimation.MoveCursorFactory = MoveCursorFactory;
        var DrawSegmentFactory = (function (_super) {
            __extends(DrawSegmentFactory, _super);
            function DrawSegmentFactory() {
                _super.apply(this, arguments);
            }
            DrawSegmentFactory.prototype.FromSVG = function (node) {
                if (node.localName === DrawSegmentFactory.NodeName) {
                    return new DrawNextSegment(SVGA.numAttr(node, "t"));
                }
                // else pass through the chain of responsibility
                return _super.prototype.FromSVG.call(this, node);
            };
            DrawSegmentFactory.prototype.ToSVG = function (cmd) {
                if (cmd instanceof DrawNextSegment) {
                    return SVGA.CreateElement(DrawSegmentFactory.NodeName, {
                        "t": precise(cmd.Time, TIME_PRECISION)
                    });
                }
                // else pass through the chain of responsibility
                return _super.prototype.ToSVG.call(this, cmd);
            };
            DrawSegmentFactory.NodeName = "ds";
            return DrawSegmentFactory;
        })(CommandFactory);
        SVGAnimation.DrawSegmentFactory = DrawSegmentFactory;
        var ChangeBrushColorFactory = (function (_super) {
            __extends(ChangeBrushColorFactory, _super);
            function ChangeBrushColorFactory() {
                _super.apply(this, arguments);
            }
            ChangeBrushColorFactory.prototype.FromSVG = function (node) {
                if (node.localName === ChangeBrushColorFactory.NodeName) {
                    return new ChangeBrushColor(new UI.Color("", SVGA.attr(node, "d")), SVGA.numAttr(node, "t"));
                }
                // else pass through the chain of responsibility
                return _super.prototype.FromSVG.call(this, node);
            };
            ChangeBrushColorFactory.prototype.ToSVG = function (cmd) {
                if (cmd instanceof ChangeBrushColor) {
                    return SVGA.CreateElement(ChangeBrushColorFactory.NodeName, {
                        "d": cmd.Color.CssValue,
                        "t": precise(cmd.Time, TIME_PRECISION)
                    });
                }
                // else pass through the chain of responsibility
                return _super.prototype.ToSVG.call(this, cmd);
            };
            ChangeBrushColorFactory.NodeName = "c";
            return ChangeBrushColorFactory;
        })(CommandFactory);
        SVGAnimation.ChangeBrushColorFactory = ChangeBrushColorFactory;
        var ChangeBrushSizeFactory = (function (_super) {
            __extends(ChangeBrushSizeFactory, _super);
            function ChangeBrushSizeFactory() {
                _super.apply(this, arguments);
            }
            ChangeBrushSizeFactory.prototype.FromSVG = function (node) {
                if (node.localName === ChangeBrushSizeFactory.NodeName) {
                    return new ChangeBrushSize(new UI.BrushSize("", SVGA.numAttr(node, "d"), SVGA.attr(node, "u")), SVGA.numAttr(node, "t"));
                }
                // else pass through the chain of responsibility
                return _super.prototype.FromSVG.call(this, node);
            };
            ChangeBrushSizeFactory.prototype.ToSVG = function (cmd) {
                if (cmd instanceof ChangeBrushSize) {
                    return SVGA.CreateElement(ChangeBrushSizeFactory.NodeName, {
                        "d": cmd.Size.Size,
                        "u": cmd.Size.Unit,
                        "t": precise(cmd.Time, TIME_PRECISION)
                    });
                }
                // else pass through the chain of responsibility
                return _super.prototype.ToSVG.call(this, cmd);
            };
            ChangeBrushSizeFactory.NodeName = "s";
            return ChangeBrushSizeFactory;
        })(CommandFactory);
        SVGAnimation.ChangeBrushSizeFactory = ChangeBrushSizeFactory;
        var ClearCanvasFactory = (function (_super) {
            __extends(ClearCanvasFactory, _super);
            function ClearCanvasFactory() {
                _super.apply(this, arguments);
            }
            ClearCanvasFactory.prototype.FromSVG = function (node) {
                if (node.localName === ClearCanvasFactory.NodeName) {
                    return new ClearCanvas(SVGA.numAttr(node, "t"));
                }
                // else pass through the chain of responsibility
                return _super.prototype.FromSVG.call(this, node);
            };
            ClearCanvasFactory.prototype.ToSVG = function (cmd) {
                if (cmd instanceof ClearCanvas) {
                    return SVGA.CreateElement(ClearCanvasFactory.NodeName, {
                        "t": precise(cmd.Time, TIME_PRECISION)
                    });
                }
                // else pass through the chain of responsibility
                return _super.prototype.ToSVG.call(this, cmd);
            };
            ClearCanvasFactory.NodeName = "e";
            return ClearCanvasFactory;
        })(CommandFactory);
        SVGAnimation.ClearCanvasFactory = ClearCanvasFactory;
    })(SVGAnimation = VideoFormat.SVGAnimation || (VideoFormat.SVGAnimation = {}));
})(VideoFormat || (VideoFormat = {}));
