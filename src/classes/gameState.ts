import { IGameUpdate } from '../interfaces/iGameUpdate';
import { IHighScore } from '../interfaces/iHighScore';
import { Difficulty, GameMode, LetterGrade } from '../utilities/enum';
import * as Persistence from '../utilities/persistence';
import * as Shared from '../utilities/shared';

export class GameState {
    private static readonly highScoresLocalStorageKey: string = 'ENDURE_HIGH_SCORES';
    private static readonly difficultyLocalStorageKey: string = 'ENDURE_DIFFICULTY';
    private static readonly playerNameLocalStorageKey: string = 'ENDURE_PLAYER_NAME';
    private static readonly defaultPlayerName: string = 'Anonymous';
    private static readonly defaultDifficulty: Difficulty = Difficulty.medium;
    private static readonly numberOfHighScoresToPersist: number = 10;

    private static getStage(score: number): number {
        const stage: number = Math.log(score);

        return Math.floor(stage * stage);
    }

    private static isValidPlayerName(playerName: string): boolean {
        return playerName.trim() !== '';
    }

    public static isInProgress(gameMdode: GameMode): boolean {
        return gameMdode === GameMode.inGame || gameMdode === GameMode.paused;
    }

    public static getPersistedState(): GameState {
        return new GameState(GameMode.newGame,
                             Persistence.fetchStorableEnumValue(GameState.difficultyLocalStorageKey, Difficulty, GameState.defaultDifficulty) as Difficulty,
                             Persistence.fetchHighScores(GameState.highScoresLocalStorageKey),
                             Shared.castSafeOr(Persistence.fetchString(GameState.playerNameLocalStorageKey), GameState.defaultPlayerName));
    }

    public static persistState(state: GameState): void {
        Persistence.persistData(GameState.difficultyLocalStorageKey, state.difficulty);
        Persistence.persistData(GameState.highScoresLocalStorageKey, state.highScores);
        Persistence.persistData(GameState.playerNameLocalStorageKey, GameState.isValidPlayerName(state.playerName) ? state.playerName : GameState.defaultPlayerName);
    }

    public static getNextStateFromUpdate(update: IGameUpdate, state: GameState): GameState {
        const playerName: string = Shared.castSafeOr(update.playerName, state.playerName),
              difficulty: Difficulty =  Shared.castSafeOr(update.difficulty, state.difficulty),
              highScores: IHighScore[][] = state.highScores;

        let stage: number = state.score,
            score: number = state.score,
            gameMode: GameMode =  Shared.castSafeOr(update.gameMode, state.gameMode),
            letterGrade: number =  Shared.castSafeOr(update.letterGrade, state.letterGrade),
            combo: number = Shared.isDefined(update.dropCombo) ? 0 : state.combo;

        if (Shared.isDefined(update.points)) {
            score += ((update.points as number) * Math.max(combo, 1));
            ++combo;
            stage = GameState.getStage(score);

            if (stage > state.stage) {
                letterGrade = LetterGrade.aPlus;
            }
        }

        if (letterGrade === LetterGrade.f) {
            gameMode = GameMode.gameOver;
        }

        if (gameMode === GameMode.gameOver && score > 0) {
            highScores[difficulty] = highScores[difficulty].concat({
                                                                dateStamp: Shared.getDateStamp(new Date()),
                                                                difficulty,
                                                                name: state.playerName,
                                                                value: score
                                                            }).sort((a, b) => b.value - a.value)
                                                              .slice(0, GameState.numberOfHighScoresToPersist);
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
                             letterGrade);
    }

    public constructor(public gameMode: GameMode,
                       public difficulty: Difficulty,
                       public highScores: IHighScore[][],
                       public playerName: string,
                       public combo: number = 0,
                       public score: number = 0,
                       public stage: number = 0,
                       public letterGrade: LetterGrade = LetterGrade.aPlus) {
        this.playerName = GameState.isValidPlayerName(playerName) ? playerName : GameState.defaultPlayerName;
    }
}