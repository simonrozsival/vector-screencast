import { Reader } from '../VideoFormat/VideoFormat';
import { DrawingStrategy } from '../Drawing/DrawingStrategy';
import * as Localization from '../Localization/Player';
import PlayerUI from '../UI/PlayerUI';
export interface PlayerSettings {
    Source: string;
    VideoFormat?: Reader;
    DrawingStrategy?: DrawingStrategy;
    Localization?: Localization.Player;
    UI?: PlayerUI;
    Autoplay?: boolean;
    Autohide?: boolean;
    ShowControls?: boolean;
}
