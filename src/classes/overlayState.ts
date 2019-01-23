import { IHighScore } from '../interfaces/iHighScore';
import { IOverlayProps } from '../interfaces/iOverlayProps';
import { Difficulty, HighScoreListing } from '../utilities/enum';
import { OverlayMenu } from './overlayMenu';

export class OverlayState {
    public globalHighScores: IHighScore[];
    public highScoreDifficulty: Difficulty;
    public highScoreListing: HighScoreListing;
    public playerName: string;
    public waiting: boolean;
    public noConnectivity: boolean;
    public selectedOptionIndex: number;
    public readonly menu: OverlayMenu;

    public constructor(props: IOverlayProps, onNameChange: () => void) {
        this.menu = new OverlayMenu(props.onUpdate, onNameChange);
        this.playerName = props.playerName;
        this.selectedOptionIndex = this.menu.getDefaultOptionIndex(props);
        this.waiting = false;
        this.globalHighScores = [];
        this.highScoreListing = HighScoreListing.local;
        this.highScoreDifficulty = props.difficulty;
        this.noConnectivity = false;
    }
}