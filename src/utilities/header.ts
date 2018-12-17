import * as App from './app';
import * as Game from './game';

interface IProps {
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

export {
    IProps
};