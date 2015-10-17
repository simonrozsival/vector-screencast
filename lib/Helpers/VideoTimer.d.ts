export default class VideoTimer {
    private clock;
    private startTime;
    StartTime: number;
    private paused;
    CurrentTime(): number;
    SetTime(milliseconds: number): void;
    private pauseTime;
    Pause(): void;
    Resume(): void;
    Reset(): void;
    constructor(running?: boolean);
}
