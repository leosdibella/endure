import * as App from './app';
import * as General from './general';
import { Maybe } from './maybe';
import * as Persistence from './persistence';

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

class HighScore {
    public name: string;
    public difficulty: App.Difficulty;
    public value: number;
    public dateStamp: string;

    public constructor(name: string, value: number, dateStamp: string, difficulty: App.Difficulty) {
        this.name = name;
        this.value = value;
        this.dateStamp = dateStamp;
        this.difficulty = difficulty;
    }
}

interface IUpdate {
    points?: number;
    mode?: Mode;
    difficulty?: App.Difficulty;
    theme?: App.Theme;
    playerName?: string;
    dropCombo?: boolean;
    letterGrade?: number;
}

class State {
    private static readonly highScoresLocalStorageKey: string = 'ENDURE_HIGH_SCORES';
    private static readonly difficultyLocalStorageKey: string = 'ENDURE_DIFFICULTY';
    private static readonly playerNameLocalStorageKey: string = 'ENDURE_PLAYER_NAME';
    private static readonly defaultPlayerName: string = 'Anonymous';
    private static readonly defaultDifficulty: App.Difficulty = App.Difficulty.medium;
    private static readonly numberOfHighScoresToPersist: number = 10;

    private static getStage(score: number): number {
        const stage: number = Math.log(score);
        return Math.floor(stage * stage);
    }

    private static getHighScores(highScores: any): HighScore[] {
        const highScoreArray: HighScore[] = [];

        if (Array.isArray(highScores)) {
            highScores.forEach(hs => {
                if (General.isObject(hs)
                        && General.isString(hs.name)
                        && General.isString(hs.dateStamp)
                        && General.isInteger(hs.value)
                        && General.isInteger(hs.difficulty)) {
                    new Maybe(App.Difficulty[hs.difficulty]).justDo(() => {
                        highScoreArray.push(new HighScore(hs.name, hs.dateStamp, hs.value, hs.difficulty));
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
                         Persistence.fetchEnumValue(State.difficultyLocalStorageKey, App.Difficulty, State.defaultDifficulty),
                         Persistence.fetchData(State.highScoresLocalStorageKey).caseOf(hs => State.getHighScores(hs), () => []),
                         Persistence.fetchData(State.playerNameLocalStorageKey).getOrDefault(State.defaultPlayerName));
    }

    public static persistState(state: State): void {
        Persistence.persistData(State.difficultyLocalStorageKey, state.difficulty);
        Persistence.persistData(State.highScoresLocalStorageKey, state.highScores);
        Persistence.persistData(State.playerNameLocalStorageKey, State.isValidPlayerName(state.playerName) ? state.playerName : State.defaultPlayerName);
    }

    public static getNextStateFromUpdate(update: IUpdate, state: State): State {
        const playerName: string = new Maybe(update.playerName).getOrDefault(state.playerName),
        difficulty: App.Difficulty = new Maybe(update.difficulty).getOrDefault(state.difficulty);

        let stage: number = state.score,
            score: number = state.score,
            mode: Mode = new Maybe(update.mode).getOrDefault(state.mode),
            letterGrade: number = new Maybe(update.letterGrade).getOrDefault(state.letterGrade),
            highScores: HighScore[] = state.highScores,
            combo: number = new Maybe(update.dropCombo).caseOf(p => 0, () => state.combo);

        new Maybe(update.points).justDo(p => {
            score += (p * Math.max(combo, 1));
            ++combo;
            stage = State.getStage(score);
        });

        if (letterGrade === App.LetterGrade.f) {
            mode = Mode.gameOver;
        }

        if (mode === Mode.gameOver) {
            highScores = highScores.concat(new HighScore(state.playerName, score, General.getDateStamp(new Date()), difficulty))
                                   .sort((a, b) => b.value - a.value)
                                   .slice(0, State.numberOfHighScoresToPersist);
        } else if (State.isInProgress(state.mode) && State.isInProgress(mode) && state.mode !== mode) {
            mode = mode === Mode.paused ? Mode.inGame : Mode.paused;
        }

        if (mode === Mode.gameOver || mode === Mode.newGame) {
            score = 0;
            combo = 0;
            stage = 0;
            letterGrade = App.LetterGrade.aPlus;
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

    public mode: Mode;
    public combo: number;
    public score: number;
    public stage: number;
    public letterGrade: number;
    public difficulty: App.Difficulty;
    public highScores: HighScore[];
    public playerName: string;

    public constructor(mode: Mode,
                       difficulty: App.Difficulty,
                       highScores: HighScore[],
                       playerName: string,
                       combo: number = 0,
                       score: number = 0,
                       stage: number = 0,
                       letterGrade: App.LetterGrade = App.LetterGrade.aPlus) {
        this.mode = mode;
        this.difficulty = difficulty;
        this.playerName = State.isValidPlayerName(playerName) ? playerName : State.defaultPlayerName;
        this.combo = combo;
        this.score = score;
        this.stage = stage;
        this.letterGrade = letterGrade;
        this.highScores = highScores;
    }
}

interface IProps {
    theme: App.Theme;
    orientation: App.Orientation;
    readonly onUpdate: (updates: App.IUpdate) => void;
}

export {
    Mode,
    HighScore,
    IUpdate,
    State,
    IProps
};