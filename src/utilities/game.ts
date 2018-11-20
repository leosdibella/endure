import { App } from './app';
import { General } from './general';
import { Grade } from './utilities';

export namespace Game {
    const highScoresLocalStorageKey: string = 'ENDURE_HIGH_SCORES';
    const difficultyLocalStorageKey: string = 'ENDURE_DIFFICULTY';
    const playerNameLocalStorageKey: string = 'ENDURE_PLAYER_NAME';
    const defaultPlayerName: string = 'Anonymous';
    const numberOfHighScoresToPersist: number = 10;

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

    export interface IHighScore {
        name: string;
        value: number;
        dateStamp: string;
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

    export class State {
        mode: Mode;
        combo: number;
        score: number;
        stage: number;
        letterGrade: number;
        difficulty: Difficulty;
        highScores: IHighScore[];
        playerName: string;

        constructor(mode: Mode,
                    difficulty: Difficulty,
                    highScores: IHighScore[],
                    playerName: string,
                    combo: number,
                    score: number,
                    stage: number,
                    letterGrade: Grade.LetterGrade) {
            this.mode = General.isWellDefinedValue(Mode[mode]) ? mode : Mode.newGame;
            this.difficulty = General.isWellDefinedValue(Difficulty[difficulty]) ? difficulty : Difficulty.medium;
            this.playerName = isValidPlayerName(playerName) ? playerName : defaultPlayerName;
            this.combo = General.castSafeOr(combo, 0);
            this.score = General.castSafeOr(score, 0);;
            this.stage = General.castSafeOr(stage, 0);;
            this.letterGrade = General.isWellDefinedValue(Grade.LetterGrade[letterGrade]) ? letterGrade : Grade.LetterGrade.aPlus;
            this.highScores = highScores;
        };
    };
    
    export interface IProps {
        theme: App.Theme;
        orientation: App.Orientation;
        readonly onUpdate: (updates: App.IUpdate) => void;
    };

    export function isValidPlayerName(playerName: string) : boolean {
        return General.isWellDefinedValue(playerName) && playerName.trim() !== '';
    };

    export function isInProgress(gameMdode: Mode) : boolean {
        return gameMdode === Mode.inGame || gameMdode === Mode.paused;
    };
    
    export function getPersistedState() : State {
        let playerName: string,
            highScores: string,
            difficulty: number,
            parsedHighScores: any;

        if (General.isLocalStorageSupported()) {
            highScores = window.localStorage.getItem(highScoresLocalStorageKey);
            playerName = window.localStorage.getItem(playerNameLocalStorageKey);
            difficulty = parseInt(window.localStorage.getItem(difficultyLocalStorageKey));

            if (General.isWellDefinedValue(highScores)) {
                parsedHighScores = JSON.parse(highScores);

                if (!Array.isArray(parsedHighScores) || parsedHighScores.length === 0) {
                    parsedHighScores = [];
                }
            }
        }

        return new State(Mode.newGame,
                         difficulty as Difficulty,
                         parsedHighScores,
                         playerName,
                         0,
                         0,
                         0,
                         0);
    };
    
    export function persistState(state: State) : void {
        if (General.isLocalStorageSupported()) {
            window.localStorage.setItem(difficultyLocalStorageKey, state.difficulty.toString());
            window.localStorage.setItem(highScoresLocalStorageKey, JSON.stringify(state.highScores));
            window.localStorage.setItem(playerNameLocalStorageKey, isValidPlayerName(state.playerName) ? state.playerName : defaultPlayerName);
        }
    }

    function getStage(score: number) : number {
        let stage: number = Math.log(score);
        return Math.floor(stage * stage);
    };

    export function getNextStateFromUpdate(update: IUpdate, state: State) : State {
        let stage: number = state.score,
            score: number = state.score,
            combo: number = update.dropCombo ? 0 : state.combo,
            letterGrade: number = General.castSafeOr(update.letterGrade, state.letterGrade),
            highScores: IHighScore[] = this.state.highScores;

        if (General.isWellDefinedValue(update.points)) {
            score += (update.points * combo);
            ++combo;
            stage = getStage(score);
        }

        if (letterGrade === Grade.LetterGrade.f) {
            update.mode = Mode.gameOver;
        }

        if (update.mode === Mode.gameOver) {
            const highScore: IHighScore = {
                value: score,
                name: this.state.playerName,
                dateStamp: General.getDateStamp(new Date())
            };

            highScores = highScores.concat(highScore)
                                   .sort((a, b) => b.value - a.value)
                                   .slice(0, numberOfHighScoresToPersist);
        }

        if (update.mode === Mode.gameOver || update.mode === Mode.newGame) {
            score = 0;
            combo = 0;
            stage = 0;
            letterGrade = Grade.LetterGrade.aPlus;
        }

        return new State(General.castSafeOr(update.mode, this.state.mode),
                         state.difficulty,
                         highScores,
                         isValidPlayerName(update.playerName) ? update.playerName : defaultPlayerName,
                         combo,
                         score,
                         stage,
                         letterGrade);
    };
};