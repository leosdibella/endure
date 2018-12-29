import { IGameUpdate } from '../interfaces/iGameUpdate';
import { IOverlayMenuOption } from '../interfaces/iOverlayMenuOption';
import { IOverlayProps } from '../interfaces/iOverlayProps';
import { Difficulty, GameMode, Theme } from '../utilities/enum';
import * as Shared from '../utilities/shared';

export class OverlayMenu {
    private static readonly defaultDefaultOptionsIndex: number = 0;

    public static readonly menuOptionInitializers: ((callback: (update: IGameUpdate) => void, onNameChange: () => void) => (IOverlayMenuOption | undefined))[] = [
        (callback: (update: IGameUpdate) => void): IOverlayMenuOption => {
            return {
                actions: [
                    GameMode.inGame,
                    GameMode.specifyName,
                    GameMode.selectDifficulty,
                    GameMode.highScores,
                    GameMode.setTheme
                ].map(gm => () => callback({
                    gameMode: gm
                })),
                className: 'new-game',
                defaultOptionsIndex: 0,
                options: ['New Game', 'Set Name', 'Difficulty', 'High Scores', 'Settings'],
                title: 'Endure'
            };
        },
        (callback: (update: IGameUpdate) => void, onNameChange: () => void): IOverlayMenuOption => {
            return {
                actions: [onNameChange, () => callback({
                    gameMode: GameMode.newGame
                })],
                className: 'player-name',
                defaultOptionsIndex: 0,
                options: ['Remember it!', 'Forget it.'],
                title: 'Name?'
            };
        },
        (callback: (update: IGameUpdate) => void): IOverlayMenuOption => {
            return {
                actions: Shared.getNumericEnumKeys(Difficulty).map(k => () => callback({
                    difficulty: k as Difficulty,
                    gameMode: GameMode.newGame
                })),
                className: 'select-difficulty',
                options: ['[ Pre-K ] I made poop.',  '[ K - 5 ] No I don\'t wanna!', '[ 6 - 8 ] Remove the training wheels!', '[ 9 - 12 ] Test me sensei!', '[ 12+ ] I know kung fu.'],
                title: 'Grade Level'
            };
        },
        (): undefined => undefined,
        (callback: (update: IGameUpdate) => void): IOverlayMenuOption => {
            return {
                actions: [GameMode.inGame, GameMode.newGame].map(gm => () => callback({
                    gameMode: gm
                })),
                className: 'game-over',
                defaultOptionsIndex: 0,
                options: ['Put me in coach!', 'I Quit.'],
                title: 'Game Over'
            };
        },
        (callback: (update: IGameUpdate) => void): IOverlayMenuOption => {
            return {
                actions: [GameMode.paused, GameMode.newGame].map(gm => () => callback({
                    gameMode: gm
                })),
                className: 'paused',
                defaultOptionsIndex: 0,
                options: ['Put me in coach!', 'I Quit.'],
                title:'Timeout'
            };
        },
        (callback: (update: IGameUpdate) => void): IOverlayMenuOption => {
            return {
                actions: [GameMode.newGame, GameMode.inGame].map(gm => () => callback({
                    gameMode: gm
                })),
                className: 'quit-confirmation',
                defaultOptionsIndex: 1,
                options: ['Yep', 'Nope'],
                title: 'Quit?'
            };
        },
        (callback: (update: IGameUpdate) => void): IOverlayMenuOption => {
            return {
                actions: [() => callback({
                    gameMode: GameMode.newGame
                })],
                className: 'high-scores',
                defaultOptionsIndex: 0,
                options: ['Leave'],
                title: 'Honor Roll',
            };
        },
        (callback: (update: IGameUpdate) => void): IOverlayMenuOption => {
            return {
                actions: Shared.getNumericEnumKeys(Theme).map(t => () => callback({
                    gameMode: GameMode.newGame,
                    theme: t as Theme
                })),
                className: 'theme',
                options: ['Yep', 'Nope'],
                title: 'Lights On?'
            };
        }];

    public readonly menuOptions: (IOverlayMenuOption | undefined)[];

    public getDefaultOptionIndex(props: IOverlayProps): number {
        if (props.gameMode === GameMode.selectDifficulty) {
            return props.difficulty;
        }

        if (props.gameMode === GameMode.setTheme) {
            return props.theme === Theme.light ? 0 : 1;
        }

        const menuOption: IOverlayMenuOption | undefined = this.menuOptions[props.gameMode];

        if (Shared.isDefined(menuOption)) {
            return Shared.castSafeOr((menuOption as IOverlayMenuOption).defaultOptionsIndex, OverlayMenu.defaultDefaultOptionsIndex);
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