import { App } from './app';
import { Game } from './game';

export namespace TopBar {
    export interface IProps {
        mode: Game.Mode;
        theme: App.Theme;
        letterGrade: App.LetterGrade;
        difficulty: App.Difficulty;
        combo: number;
        score: number;
        stage: number;
        playerName: string;
        readonly onUpdate: (updates: Game.IUpdate) => void;
    }
}