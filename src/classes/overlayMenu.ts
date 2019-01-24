import { OverlayMenuOption } from '../classes/overlayMenuOption';
import { IGameUpdate } from '../interfaces/iGameUpdate';
import { IOverlayProps } from '../interfaces/iOverlayProps';
import { Difficulty, GameMode, Theme } from '../utilities/enum';
import * as Shared from '../utilities/shared';

export class OverlayMenu {
    private static readonly defaultDefaultOptionsIndex: number = 0;

    public static readonly menuOptionInitializers: ((callback: (update: IGameUpdate) => void, onNameChange: () => void) => (OverlayMenuOption | undefined))[] = [
        (callback: (update: IGameUpdate) => void): OverlayMenuOption => {
            return new OverlayMenuOption('Endure',
                                         'new-game',
                                         ['New Game', 'Set Name', 'Difficulty', 'High Scores', 'Settings'],
                                         [GameMode.inGame, GameMode.specifyName, GameMode.selectDifficulty, GameMode.highScores, GameMode.setTheme].map(gm => () => callback({
                                             gameMode: gm
                                         })),
                                         0);
        },
        (callback: (update: IGameUpdate) => void, onNameChange: () => void): OverlayMenuOption => {
            return new OverlayMenuOption('Name?',
                                         'player-name',
                                         ['Remember it!', 'Forget it.'],
                                         [onNameChange, () => callback({
                                             gameMode: GameMode.newGame
                                         })],
                                         0);
        },
        (callback: (update: IGameUpdate) => void): OverlayMenuOption => {
            return new OverlayMenuOption('Grade Level',
                                         'select-difficulty',
                                         ['[ Pre-K ] I made poop.',  '[ K - 5 ] No I don\'t wanna!', '[ 6 - 8 ] Remove the training wheels!', '[ 9 - 12 ] Test me sensei!', '[ 12+ ] I know kung fu.'],
                                         Shared.getNumericEnumKeys(Difficulty).map(k => () => callback({
                                            difficulty: k as Difficulty,
                                            gameMode: GameMode.newGame
                                        })));
        },
        (): undefined => undefined,
        (callback: (update: IGameUpdate) => void): OverlayMenuOption => {
            return new OverlayMenuOption('Game Over',
                                         'game-over',
                                         ['Put me in coach!', 'I Quit.'],
                                         [GameMode.inGame, GameMode.newGame].map(gm => () => callback({
                                            gameMode: gm
                                         })),
                                         0);
        },
        (callback: (update: IGameUpdate) => void): OverlayMenuOption => {
            return new OverlayMenuOption('Timeout',
                                         'paused',
                                         ['Put me in coach!', 'I Quit.'],
                                         [GameMode.inGame, GameMode.newGame].map(gm => () => callback({
                                            gameMode: gm
                                         })),
                                         0);
        },
        (callback: (update: IGameUpdate) => void): OverlayMenuOption => {
            return new OverlayMenuOption('Honor Roll',
                                         'high-scores',
                                         ['Leave'],
                                         [() => callback({
                                            gameMode: GameMode.newGame
                                         })],
                                         0);
        },
        (callback: (update: IGameUpdate) => void): OverlayMenuOption => {
            return new OverlayMenuOption('Lights On?',
                                         'theme',
                                         ['Yep', 'Nope'],
                                         Shared.getNumericEnumKeys(Theme).map(t => () => callback({
                                            gameMode: GameMode.newGame,
                                            theme: t as Theme
                                        })));
        }];

    public readonly menuOptions: (OverlayMenuOption | undefined)[];

    public getDefaultOptionIndex(props: IOverlayProps): number {
        if (props.gameMode === GameMode.selectDifficulty) {
            return props.difficulty as number;
        }

        if (props.gameMode === GameMode.setTheme) {
            return props.theme as number;
        }

        const menuOption: OverlayMenuOption | undefined = this.menuOptions[props.gameMode];

        if (Shared.isDefined(menuOption)) {
            return Shared.castSafeOr((menuOption as OverlayMenuOption).defaultOptionsIndex, OverlayMenu.defaultDefaultOptionsIndex);
        } else {
            return OverlayMenu.defaultDefaultOptionsIndex;
        }
    }

    public constructor(callback: (update: IGameUpdate) => void, onNameChange: () => void) {
        this.menuOptions = OverlayMenu.menuOptionInitializers.map(moi => {
            return moi(callback, onNameChange);
        });
    }
}