import { App } from './app';
import { General } from './general';
import { Grade } from './grade';
import { Maybe } from './maybe';
import { PersistentStorage } from './persistentStorage';

export namespace Game {
    export enum Mode {
        newGame = 0,
        specifyName,
        selectDifficulty,
        inGame,
        gameOver,
        paused,
        quitConfirmation,
        highScores,
        setTheme
    };

    export enum Difficulty {
        beginnger = 0,
        low,
        medium,
        hard,
        expert
    };

    export class HighScore {
        name: string;
        value: number;
        dateStamp: string;

        constructor(name: string, value: number, dateStamp: string) {
            this.name = name;
            this.value = value;
            this.dateStamp = dateStamp;
        };
    };

    export interface IUpdate {
        points?: number;
        mode?: Mode;
        difficulty?: Difficulty;
        theme?: App.Theme;
        playerName?: string;
        dropCombo?: boolean;
        letterGrade?: number;
    };

    const highScoresLocalStorageKey: string = 'ENDURE_HIGH_SCORES';
    const difficultyLocalStorageKey: string = 'ENDURE_DIFFICULTY';
    const playerNameLocalStorageKey: string = 'ENDURE_PLAYER_NAME';
    const defaultPlayerName: string = 'Anonymous';
    const defaultDifficulty: Difficulty = Difficulty.medium;
    const numberOfHighScoresToPersist: number = 10;

    export class State {
        mode: Mode;
        combo: number;
        score: number;
        stage: number;
        letterGrade: number;
        difficulty: Difficulty;
        highScores: HighScore[];
        playerName: string;

        constructor(mode: Mode,
                    difficulty: Difficulty,
                    highScores: HighScore[],
                    playerName: string,
                    combo: number = 0,
                    score: number = 0,
                    stage: number = 0,
                    letterGrade: Grade.LetterGrade = Grade.LetterGrade.aPlus) {
            this.mode = mode;
            this.difficulty = difficulty;
            this.playerName = isValidPlayerName(playerName) ? playerName : defaultPlayerName;
            this.combo = combo;
            this.score = score;
            this.stage = stage;
            this.letterGrade = letterGrade;
            this.highScores = highScores;
        };
    };
    
    export interface IProps {
        theme: App.Theme;
        orientation: App.Orientation;
        readonly onUpdate: (updates: App.IUpdate) => void;
    };

    export function isValidPlayerName(playerName: string) : boolean {
        return playerName.trim() !== '';
    };

    export function isInProgress(gameMdode: Mode) : boolean {
        return gameMdode === Mode.inGame || gameMdode === Mode.paused;
    };

    function getHighScores(highScores: any) : HighScore[] {
        const highScoreArray: HighScore[] = [];
        let highScore: any;

        if (Array.isArray(highScores)) {
            for (let i: number = 0; i < highScores.length; ++i) {
                highScore = highScores[i];

                if (General.isObject(highScore)
                        && General.isString(highScore.name)
                        && General.isString(highScore.dateStamp)
                        && General.isInteger(highScore.value)) {
                    highScoreArray.push(new HighScore(highScore.name, highScore.dateStamp,highScore.value));
                }
            }
        }

        return highScoreArray;
    };
    
    export function getPersistedState() : State {
        const playerName: string = PersistentStorage.fetch(playerNameLocalStorageKey).getOrDefault(defaultPlayerName),
              highScores: HighScore[] = PersistentStorage.fetch(highScoresLocalStorageKey).caseOf(hs => getHighScores(hs), () => []),
              difficulty: Difficulty = PersistentStorage.fetch(difficultyLocalStorageKey).caseOf(d => new Maybe(Difficulty[d]).switchInto(d, defaultDifficulty),
                                                                                                 () => defaultDifficulty);

        return new State(Mode.newGame,
                         difficulty,
                         highScores,
                         playerName);
    };
    
    export function persistState(state: State) : void {
        PersistentStorage.persist(difficultyLocalStorageKey, state.difficulty);
        PersistentStorage.persist(highScoresLocalStorageKey, state.highScores);
        PersistentStorage.persist(playerNameLocalStorageKey, isValidPlayerName(state.playerName) ? state.playerName : defaultPlayerName);
    }

    function getStage(score: number) : number {
        let stage: number = Math.log(score);
        return Math.floor(stage * stage);
    };

    export function getNextStateFromUpdate(update: IUpdate, state: State) : State {
        let stage: number = state.score,
            score: number = state.score,
            playerName: string = new Maybe(update.playerName).getOrDefault(state.playerName),
            mode: Game.Mode = new Maybe(update.mode).getOrDefault(state.mode),
            letterGrade: number = new Maybe(update.letterGrade).getOrDefault(state.letterGrade),
            highScores: HighScore[] = state.highScores,
            combo: number = new Maybe(update.dropCombo).caseOf(p => 0, () => state.combo);

        new Maybe(update.points).justDo(p => {
            score += (p * Math.max(combo, 1));
            ++combo;
            stage = getStage(score);
        });

        if (letterGrade === Grade.LetterGrade.f) {
            mode = Mode.gameOver;
        }

        if (mode === Mode.gameOver) {
            highScores = highScores.concat(new HighScore(state.playerName, score, General.getDateStamp(new Date())))
                                   .sort((a, b) => b.value - a.value)
                                   .slice(0, numberOfHighScoresToPersist);
        } else if (isInProgress(state.mode) && isInProgress(mode) && state.mode !== mode) {
            mode === Mode.paused ? Mode.inGame : Mode.paused;
        }
        
        if (mode === Mode.gameOver || mode === Mode.newGame) {
            score = 0;
            combo = 0;
            stage = 0;
            letterGrade = Grade.LetterGrade.aPlus;
        }

        if (mode === Mode.newGame && state.mode === Mode.inGame) {
            mode = Mode.quitConfirmation;
        }

        return new State(mode,
                         state.difficulty,
                         highScores,
                         playerName,
                         combo,
                         score,
                         stage,
                         letterGrade);
    };
};