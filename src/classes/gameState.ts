import { IGameUpdate } from '../interfaces/iGameUpdate';
import { IHighScore } from '../interfaces/iHighScore';
import { Difficulty, GameMode, LetterGrade } from '../utilities/enum';
import { fetchLocalHighScores, fetchStorableEnumValue, fetchString, persistGlobalHighScoreAsync, persistLocalData } from '../utilities/persistence';
import { castSafeOr, getDateStamp, isDefined } from '../utilities/shared';

export class GameState {
    private static readonly highScoresLocalStorageKey: string = 'ENDURE_HIGH_SCORES';
    private static readonly difficultyLocalStorageKey: string = 'ENDURE_DIFFICULTY';
    private static readonly playerNameLocalStorageKey: string = 'ENDURE_PLAYER_NAME';
    private static readonly defaultPlayerName: string = 'Anonymous';
    private static readonly defaultDifficulty: Difficulty = Difficulty.medium;
    private static readonly numberOfHighScoresToPersist: number = 10;

    private static getStage(score: number): number {
        return Math.floor(Math.log(score));
    }

    private static isValidPlayerName(playerName: string): boolean {
        return playerName.trim() !== '';
    }

    public static isInProgress(gameMdode: GameMode): boolean {
        return gameMdode === GameMode.inGame || gameMdode === GameMode.paused;
    }

    public static getPersistedState(): GameState {
        return new GameState(GameMode.newGame,
                             fetchStorableEnumValue(GameState.difficultyLocalStorageKey, Difficulty, GameState.defaultDifficulty) as Difficulty,
                             fetchLocalHighScores(GameState.highScoresLocalStorageKey),
                             castSafeOr(fetchString(GameState.playerNameLocalStorageKey), GameState.defaultPlayerName));
    }

    public static persistState(state: GameState): void {
        persistLocalData(GameState.difficultyLocalStorageKey, state.difficulty);
        persistLocalData(GameState.highScoresLocalStorageKey, state.highScores);
        persistLocalData(GameState.playerNameLocalStorageKey, GameState.isValidPlayerName(state.playerName) ? state.playerName : GameState.defaultPlayerName);
    }

    public static getNextStateFromUpdate(update: IGameUpdate, state: GameState): GameState {
        const playerName: string = castSafeOr(update.playerName, state.playerName),
              difficulty: Difficulty = castSafeOr(update.difficulty, state.difficulty),
              highScores: IHighScore[][] = state.highScores;

        let maxCombo: number = state.maxCombo,
            stage: number = state.stage,
            score: number = state.score,
            gameMode: GameMode = castSafeOr(update.gameMode, state.gameMode),
            letterGrade: number = castSafeOr(update.letterGrade, state.letterGrade),
            combo: number = isDefined(update.dropCombo) ? 0 : state.combo;

        if (isDefined(update.points)) {
            score += ((update.points as number) * Math.max(combo, 1));
            ++combo;
            stage = GameState.getStage(score);
            letterGrade = stage > state.stage ? LetterGrade.aPlus : Math.max(LetterGrade.aPlus, letterGrade - 1);

            if (combo > maxCombo) {
                maxCombo = combo;
            }
        }

        if (letterGrade === LetterGrade.f) {
            gameMode = GameMode.gameOver;
        }

        if (gameMode === GameMode.gameOver && score > 0) {
            const newHighScore: IHighScore = {
                dateStamp: getDateStamp(new Date()),
                difficulty,
                maxCombo,
                name: state.playerName,
                value: score
            };

            highScores[difficulty] = highScores[difficulty].concat(newHighScore).sort((a, b) => b.value - a.value).slice(0, GameState.numberOfHighScoresToPersist);
            persistGlobalHighScoreAsync(newHighScore, difficulty);
        }

        if (!GameState.isInProgress(gameMode)) {
            score = 0;
            combo = 0;
            stage = 0;
            letterGrade = LetterGrade.aPlus;
        }

        return new GameState(gameMode,
                             difficulty,
                             highScores,
                             playerName,
                             combo,
                             score,
                             stage,
                             maxCombo,
                             letterGrade);
    }

    // TODO: Add animator for the score to have a +10,000 points or whatever whenever the score goes up.
    public constructor(public gameMode: GameMode,
                       public difficulty: Difficulty,
                       public highScores: IHighScore[][],
                       public playerName: string,
                       public combo: number = 0,
                       public score: number = 0,
                       public stage: number = 0,
                       public maxCombo: number = 0,
                       public letterGrade: LetterGrade = LetterGrade.aPlus) {
        this.playerName = GameState.isValidPlayerName(playerName) ? playerName : GameState.defaultPlayerName;
    }
}