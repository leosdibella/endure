import * as AppUtilities from './app';
import * as GameUtilities from './game';

interface IProps {
    mode: GameUtilities.Mode;
    theme: AppUtilities.Theme;
    letterGrade: AppUtilities.LetterGrade;
    difficulty: AppUtilities.Difficulty;
    combo: number;
    score: number;
    stage: number;
    playerName: string;
    readonly onUpdate: (updates: GameUtilities.IUpdate) => void;
}

export {
    IProps
};