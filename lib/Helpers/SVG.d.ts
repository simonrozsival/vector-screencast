import Vector2 from './Vector';
import { IAttributes } from './HTML';
export default class SVG {
    private static namespace;
    static Namespace: string;
    static CreateDot(center: Vector2, radius: number, color: string): Element;
    static CreateCircle(center: Vector2, radius: number, color: string): Element;
    static CreateLine(start: Vector2, end: Vector2, width: number, color: string): Element;
    static CreateElement(name: string, attributes?: IAttributes): Element;
    static SetAttributes(el: Element, attributes: IAttributes): void;
    static MoveToString(a: Vector2): string;
    static LineToString(a: Vector2): string;
    static CurveToString(a: Vector2, b: Vector2, c: Vector2): string;
    static ArcString(end: Vector2, radius: number, startAngle: number): string;
    static attr(node: Node, name: string): string;
    static numAttr(node: Node, name: string): number;
}
export declare class SVGA {
    private static namespace;
    static Namespace: string;
    static CreateElement(name: string, attributes?: IAttributes): Node;
    static SetAttributes(el: Node, attributes: IAttributes): void;
    static attr(node: Node, name: string, defaultValue?: string): string;
    static numAttr(node: Node, name: string, defaultValue?: number): number;
}
