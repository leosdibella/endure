import { App } from './app';
import { Game } from './game';
import { Grade } from './grade';

export namespace TopBar {
    export interface IProps {
        mode: Game.Mode;
        theme: App.Theme;
        letterGrade: Grade.LetterGrade;
        difficulty: Game.Difficulty;
        combo: number;
        score: number;
        stage: number;
        playerName: string;
        readonly onUpdate: (updates: Game.IUpdate) => void;
    };
};