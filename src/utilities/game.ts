import * as App from './app';
import * as General from './general';
import { Maybe } from './maybe';
import * as PersistentStorage from './persistentStorage';

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

const highScoresLocalStorageKey: string = 'ENDURE_HIGH_SCORES';
const difficultyLocalStorageKey: string = 'ENDURE_DIFFICULTY';
const playerNameLocalStorageKey: string = 'ENDURE_PLAYER_NAME';
const defaultPlayerName: string = 'Anonymous';
const defaultDifficulty: App.Difficulty = App.Difficulty.medium;
const numberOfHighScoresToPersist: number = 10;

class State {
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
        this.playerName = isValidPlayerName(playerName) ? playerName : defaultPlayerName;
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

function isValidPlayerName(playerName: string): boolean {
    return playerName.trim() !== '';
}

function isInProgress(gameMdode: Mode): boolean {
    return gameMdode === Mode.inGame || gameMdode === Mode.paused;
}

function getHighScores(highScores: any): HighScore[] {
    const highScoreArray: HighScore[] = [];

    if (Array.isArray(highScores)) {
        General.forEach(highScores, hs => {
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

function getPersistedState(): State {
    return new State(Mode.newGame,
                     PersistentStorage.fetchEnumValue(difficultyLocalStorageKey, App.Difficulty, defaultDifficulty),
                     PersistentStorage.fetchData(highScoresLocalStorageKey).caseOf(hs => getHighScores(hs), () => []),
                     PersistentStorage.fetchData(playerNameLocalStorageKey).getOrDefault(defaultPlayerName));
}

function persistState(state: State): void {
    PersistentStorage.persistData(difficultyLocalStorageKey, state.difficulty);
    PersistentStorage.persistData(highScoresLocalStorageKey, state.highScores);
    PersistentStorage.persistData(playerNameLocalStorageKey, isValidPlayerName(state.playerName) ? state.playerName : defaultPlayerName);
}

function getStage(score: number): number {
    const stage: number = Math.log(score);
    return Math.floor(stage * stage);
}

function getNextStateFromUpdate(update: IUpdate, state: State): State {
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
        stage = getStage(score);
    });

    if (letterGrade === App.LetterGrade.f) {
        mode = Mode.gameOver;
    }

    if (mode === Mode.gameOver) {
        highScores = highScores.concat(new HighScore(state.playerName, score, General.getDateStamp(new Date()), difficulty))
                               .sort((a, b) => b.value - a.value)
                               .slice(0, numberOfHighScoresToPersist);
    } else if (isInProgress(state.mode) && isInProgress(mode) && state.mode !== mode) {
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

export {
    Mode,
    HighScore,
    IUpdate,
    State,
    IProps,
    isValidPlayerName,
    isInProgress,
    getNextStateFromUpdate,
    persistState,
    getPersistedState
};