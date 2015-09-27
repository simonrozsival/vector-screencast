var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Command_1 = require('../../VideoData/Command');
var SVG_1 = require('../../Helpers/SVG');
var HelperFunctions_1 = require('../../Helpers/HelperFunctions');
var Color_1 = require('../../UI/Color');
var Brush_1 = require('../../UI/Brush');
var TIME_PRECISION = 2;
var COORDS_PRECISION = 3;
var PRESSURE_PRECISION = 4;
var CommandFactory = (function () {
    function CommandFactory(next) {
        this.next = next;
    }
    CommandFactory.prototype.FromSVG = function (node, chunkStart) {
        if (!!this.next) {
            return this.next.FromSVG(node, chunkStart);
        }
        throw new Error("Command loading failed: Unsupported node " + node.nodeName + ".");
    };
    CommandFactory.prototype.getCmdTime = function (el, chunkStart) {
        return SVG_1.SVGA.numAttr(el, "t", 0) + chunkStart;
    };
    CommandFactory.prototype.ToSVG = function (cmd, chunkStart) {
        if (!!this.next) {
            return this.next.ToSVG(cmd, chunkStart);
        }
        throw new Error("Command export failed: Unsupported command " + typeof cmd + ".");
    };
    CommandFactory.prototype.storeTime = function (el, time) {
        if (time > 0) {
            SVG_1.SVGA.SetAttributes(el, { "t": HelperFunctions_1.precise(time, TIME_PRECISION) });
        }
    };
    return CommandFactory;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CommandFactory;
var MoveCursorFactory = (function (_super) {
    __extends(MoveCursorFactory, _super);
    function MoveCursorFactory() {
        _super.apply(this, arguments);
    }
    MoveCursorFactory.prototype.FromSVG = function (node, chunkStart) {
        if (node.localName === MoveCursorFactory.NodeName) {
            return new Command_1.MoveCursor(SVG_1.SVGA.numAttr(node, "x"), SVG_1.SVGA.numAttr(node, "y"), SVG_1.SVGA.numAttr(node, "p", 0), _super.prototype.getCmdTime.call(this, node, chunkStart));
        }
        return _super.prototype.FromSVG.call(this, node, chunkStart);
    };
    MoveCursorFactory.prototype.ToSVG = function (cmd, chunkStart) {
        if (cmd instanceof Command_1.MoveCursor) {
            var options = {
                "x": HelperFunctions_1.precise(cmd.X),
                "y": HelperFunctions_1.precise(cmd.Y)
            };
            if (cmd.P > 0) {
                options["p"] = HelperFunctions_1.precise(cmd.P, PRESSURE_PRECISION);
            }
            var cmdEl = SVG_1.SVGA.CreateElement(MoveCursorFactory.NodeName, options);
            _super.prototype.storeTime.call(this, cmdEl, cmd.Time - chunkStart);
            return cmdEl;
        }
        return _super.prototype.ToSVG.call(this, cmd, chunkStart);
    };
    MoveCursorFactory.NodeName = "m";
    return MoveCursorFactory;
})(CommandFactory);
exports.MoveCursorFactory = MoveCursorFactory;
var DrawSegmentFactory = (function (_super) {
    __extends(DrawSegmentFactory, _super);
    function DrawSegmentFactory() {
        _super.apply(this, arguments);
    }
    DrawSegmentFactory.prototype.FromSVG = function (node, chunkStart) {
        if (node.localName === DrawSegmentFactory.NodeName) {
            return new Command_1.DrawNextSegment(_super.prototype.getCmdTime.call(this, node, chunkStart));
        }
        return _super.prototype.FromSVG.call(this, node, chunkStart);
    };
    DrawSegmentFactory.prototype.ToSVG = function (cmd, chunkStart) {
        if (cmd instanceof Command_1.DrawNextSegment) {
            var cmdEl = SVG_1.SVGA.CreateElement(DrawSegmentFactory.NodeName);
            _super.prototype.storeTime.call(this, cmdEl, cmd.Time - chunkStart);
            return cmdEl;
        }
        return _super.prototype.ToSVG.call(this, cmd, chunkStart);
    };
    DrawSegmentFactory.NodeName = "d";
    return DrawSegmentFactory;
})(CommandFactory);
exports.DrawSegmentFactory = DrawSegmentFactory;
var ChangeBrushColorFactory = (function (_super) {
    __extends(ChangeBrushColorFactory, _super);
    function ChangeBrushColorFactory() {
        _super.apply(this, arguments);
    }
    ChangeBrushColorFactory.prototype.FromSVG = function (node, chunkStart) {
        if (node.localName === ChangeBrushColorFactory.NodeName) {
            return new Command_1.ChangeBrushColor(new Color_1.default(SVG_1.SVGA.attr(node, "c")), _super.prototype.getCmdTime.call(this, node, chunkStart));
        }
        return _super.prototype.FromSVG.call(this, node, chunkStart);
    };
    ChangeBrushColorFactory.prototype.ToSVG = function (cmd, chunkStart) {
        if (cmd instanceof Command_1.ChangeBrushColor) {
            var cmdEl = SVG_1.SVGA.CreateElement(ChangeBrushColorFactory.NodeName, {
                "c": cmd.Color.CssValue
            });
            _super.prototype.storeTime.call(this, cmdEl, cmd.Time - chunkStart);
            return cmdEl;
        }
        return _super.prototype.ToSVG.call(this, cmd, chunkStart);
    };
    ChangeBrushColorFactory.NodeName = "c";
    return ChangeBrushColorFactory;
})(CommandFactory);
exports.ChangeBrushColorFactory = ChangeBrushColorFactory;
var ChangeBrushSizeFactory = (function (_super) {
    __extends(ChangeBrushSizeFactory, _super);
    function ChangeBrushSizeFactory() {
        _super.apply(this, arguments);
    }
    ChangeBrushSizeFactory.prototype.FromSVG = function (node, chunkStart) {
        if (node.localName === ChangeBrushSizeFactory.NodeName) {
            return new Command_1.ChangeBrushSize(new Brush_1.default(SVG_1.SVGA.numAttr(node, "w")), _super.prototype.getCmdTime.call(this, node, chunkStart));
        }
        return _super.prototype.FromSVG.call(this, node, chunkStart);
    };
    ChangeBrushSizeFactory.prototype.ToSVG = function (cmd, chunkStart) {
        if (cmd instanceof Command_1.ChangeBrushSize) {
            var cmdEl = SVG_1.SVGA.CreateElement(ChangeBrushSizeFactory.NodeName, {
                "w": cmd.Size.Size
            });
            _super.prototype.storeTime.call(this, cmdEl, cmd.Time - chunkStart);
            return cmdEl;
        }
        return _super.prototype.ToSVG.call(this, cmd, chunkStart);
    };
    ChangeBrushSizeFactory.NodeName = "s";
    return ChangeBrushSizeFactory;
})(CommandFactory);
exports.ChangeBrushSizeFactory = ChangeBrushSizeFactory;
var ClearCanvasFactory = (function (_super) {
    __extends(ClearCanvasFactory, _super);
    function ClearCanvasFactory() {
        _super.apply(this, arguments);
    }
    ClearCanvasFactory.prototype.FromSVG = function (node, chunkStart) {
        if (node.localName === ClearCanvasFactory.NodeName) {
            return new Command_1.ClearCanvas(new Color_1.default(SVG_1.SVGA.attr(node, "c")), _super.prototype.getCmdTime.call(this, node, chunkStart));
        }
        return _super.prototype.FromSVG.call(this, node, chunkStart);
    };
    ClearCanvasFactory.prototype.ToSVG = function (cmd, chunkStart) {
        if (cmd instanceof Command_1.ClearCanvas) {
            var cmdEl = SVG_1.SVGA.CreateElement(ClearCanvasFactory.NodeName, {
                "c": cmd.Color.CssValue
            });
            _super.prototype.storeTime.call(this, cmdEl, cmd.Time - chunkStart);
            return cmdEl;
        }
        return _super.prototype.ToSVG.call(this, cmd, chunkStart);
    };
    ClearCanvasFactory.NodeName = "e";
    return ClearCanvasFactory;
})(CommandFactory);
exports.ClearCanvasFactory = ClearCanvasFactory;
