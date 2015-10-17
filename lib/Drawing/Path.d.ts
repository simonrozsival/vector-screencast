import Vector2 from '../Helpers/Vector';
import VideoEvents from '../Helpers/VideoEvents';
import Segment, { ZeroLengthSegment, QuadrilateralSegment, CurvedSegment } from './Segments';
export interface PathPoint {
    Left: Vector2;
    Right: Vector2;
}
export default class Path {
    protected events: VideoEvents;
    protected curved: boolean;
    protected color: string;
    protected wireframe: boolean;
    protected segments: Array<Segment>;
    Segments: Array<Segment>;
    protected lastDrawnSegment: Segment;
    LastDrawnSegment: Segment;
    private iterator;
    private pathPoints;
    protected LastPoint: PathPoint;
    protected LastButOnePoint: PathPoint;
    protected LastButTwoPoint: PathPoint;
    private startPosition;
    private startRadius;
    constructor(events: VideoEvents, curved: boolean, color: string, wireframe?: boolean);
    Color: string;
    StartPath(pt: Vector2, radius: number): void;
    DrawStartDot(pt: Vector2, radius: number): void;
    InitPath(right: Vector2, left: Vector2): void;
    StartDrawingPath(seg: ZeroLengthSegment): void;
    ExtendPath(right: Vector2, left: Vector2): void;
    private CalculateSegment(right, left);
    private CalculateCurvedSegment(right, left);
    protected DrawCurvedSegment(segment: CurvedSegment): void;
    private CalculateQuarilateralSegment(right, left);
    protected DrawQuadrilateralSegment(segment: QuadrilateralSegment): void;
    Draw(): void;
    DrawSegment(seg: Segment): void;
    static angle(vec: Vector2): number;
    DrawWholePath(): void;
}
export declare class SvgPath extends Path {
    private canvas;
    private path;
    private right;
    private left;
    private cap;
    constructor(events: VideoEvents, curved: boolean, color: string, canvas: HTMLElement);
    DrawStartDot(position: Vector2, radius: number): void;
    InitPath(right: Vector2, left: Vector2): void;
    private CreatePathElement();
    protected DrawCurvedSegment(segment: CurvedSegment): void;
    protected DrawQuadrilateralSegment(segment: QuadrilateralSegment): void;
    GetPathString(): string;
    Draw(): void;
}
export declare class CanvasPath extends Path {
    private context;
    constructor(events: VideoEvents, curved: boolean, color: string, context: CanvasRenderingContext2D);
    DrawStartDot(position: Vector2, radius: number): void;
    private DrawDot(c, r);
    protected DrawQuadrilateralSegment(segment: QuadrilateralSegment): void;
    protected DrawCurvedSegment(segment: CurvedSegment): void;
    Draw(): void;
}
