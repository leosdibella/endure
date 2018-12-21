import * as AppUtilities from './app';
import { Maybe } from './maybe';
import * as Persistence from './persistence';
import * as Shared from './shared';

enum Mode {
    newGame = 0,
    specifyName,
    selectDifficulty,
    inGame,
    gameOver,
    paused,
    quitConfirmation,
    highScores,
    setTheme
}

interface IUpdate {
    points?: number;
    mode?: Mode;
    difficulty?: Shared.Difficulty;
    theme?: Shared.Theme;
    playerName?: string;
    dropCombo?: boolean;
    letterGrade?: number;
}

class State {
    private static readonly highScoresLocalStorageKey: string = 'ENDURE_HIGH_SCORES';
    private static readonly difficultyLocalStorageKey: string = 'ENDURE_DIFFICULTY';
    private static readonly playerNameLocalStorageKey: string = 'ENDURE_PLAYER_NAME';
    private static readonly defaultPlayerName: string = 'Anonymous';
    private static readonly defaultDifficulty: Shared.Difficulty = Shared.Difficulty.medium;
    private static readonly numberOfHighScoresToPersist: number = 10;

    private static getStage(score: number): number {
        const stage: number = Math.log(score);

        return Math.floor(stage * stage);
    }

    private static mapHHighScores(highScores: Shared.HighScore[]): Shared.HighScore[] {
        const highScoreArray: Shared.HighScore[] = [];

        if (Array.isArray(highScores)) {
            highScores.forEach(hs => {
                if (Shared.isObject(hs)
                        && Shared.isString(hs.name)
                        && Shared.isString(hs.dateStamp)
                        && Shared.isInteger(hs.value)
                        && Shared.isInteger(hs.difficulty)) {
                    new Maybe(Shared.Difficulty[hs.difficulty]).justDo(() => {
                        highScoreArray.push(new Shared.HighScore(hs.name, hs.value, hs.dateStamp, hs.difficulty));
                    });
                }
            });
        }

        return highScoreArray;
    }

    private static isValidPlayerName(playerName: string): boolean {
        return playerName.trim() !== '';
    }

    public static isInProgress(gameMdode: Mode): boolean {
        return gameMdode === Mode.inGame || gameMdode === Mode.paused;
    }

    public static getPersistedState(): State {
        return new State(Mode.newGame,
                         Persistence.fetchStorableEnumValue(State.difficultyLocalStorageKey, Shared.Difficulty, State.defaultDifficulty) as Shared.Difficulty,
                         Persistence.fetchData<Shared.HighScore[]>(State.highScoresLocalStorageKey).caseOf(hs => State.mapHHighScores(hs), () => []),
                         Persistence.fetchString(State.playerNameLocalStorageKey).getOrDefault(State.defaultPlayerName));
    }

    public static persistState(state: State): void {
        Persistence.persistData(State.difficultyLocalStorageKey, state.difficulty);
        Persistence.persistData(State.highScoresLocalStorageKey, state.highScores);
        Persistence.persistData(State.playerNameLocalStorageKey, State.isValidPlayerName(state.playerName) ? state.playerName : State.defaultPlayerName);
    }

    public static getNextStateFromUpdate(update: IUpdate, state: State): State {
        const playerName: string = new Maybe(update.playerName).getOrDefault(state.playerName),
        difficulty: Shared.Difficulty = new Maybe(update.difficulty).getOrDefault(state.difficulty);

        let stage: number = state.score,
            score: number = state.score,
            mode: Mode = new Maybe(update.mode).getOrDefault(state.mode),
            letterGrade: number = new Maybe(update.letterGrade).getOrDefault(state.letterGrade),
            highScores: Shared.HighScore[] = state.highScores,
            combo: number = new Maybe(update.dropCombo).caseOf(p => 0, () => state.combo);

        new Maybe(update.points).justDo(p => {
            score += (p * Math.max(combo, 1));
            ++combo;
            stage = State.getStage(score);
        });

        if (letterGrade === Shared.LetterGrade.f) {
            mode = Mode.gameOver;
        }

        if (mode === Mode.gameOver) {
            highScores = highScores.concat(new Shared.HighScore(state.playerName, score, Shared.getDateStamp(new Date()), difficulty))
                                   .sort((a, b) => b.value - a.value)
                                   .slice(0, State.numberOfHighScoresToPersist);
        } else if (State.isInProgress(state.mode) && State.isInProgress(mode) && state.mode !== mode) {
            mode = mode === Mode.paused ? Mode.inGame : Mode.paused;
        }

        if (mode === Mode.gameOver || mode === Mode.newGame) {
            score = 0;
            combo = 0;
            stage = 0;
            letterGrade = Shared.LetterGrade.aPlus;
        }

        if (mode === Mode.newGame && state.mode === Mode.inGame) {
            mode = Mode.quitConfirmation;
        }

        return new State(mode,
                         difficulty,
                         highScores,
                         playerName,
                         combo,
                         score,
                         stage,
                         letterGrade);
    }

    public constructor(public mode: Mode,
                       public difficulty: Shared.Difficulty,
                       public highScores: Shared.HighScore[],
                       public playerName: string,
                       public combo: number = 0,
                       public score: number = 0,
                       public stage: number = 0,
                       public letterGrade: Shared.LetterGrade = Shared.LetterGrade.aPlus) {
        this.playerName = State.isValidPlayerName(playerName) ? playerName : State.defaultPlayerName;
    }
}

interface IProps {
    theme: Shared.Theme;
    orientation: Shared.Orientation;
    onUpdate(updates: AppUtilities.IUpdate): void;
}

export {
    Mode,
    IUpdate,
    State,
    IProps
};