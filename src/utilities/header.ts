import * as GameUtilities from './game';
import * as Shared from './shared';

interface IProps {
    mode: GameUtilities.Mode;
    theme: Shared.Theme;
    letterGrade: Shared.LetterGrade;
    difficulty: Shared.Difficulty;
    combo: number;
    score: number;
    stage: number;
    playerName: string;
    onUpdate(updates: GameUtilities.IUpdate): void;
}

export {
    IProps
};