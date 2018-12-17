import { App } from './app';
import { Game } from './game';
import { General } from './general';
import { Maybe } from './maybe';

export namespace GameOverlay {
    const defaultDefaultOptionsIndex: number = 0;

    class MenuOption {
        readonly title: string;
        readonly className: string;
        readonly defaultOptionsIndex: Maybe<number>;
        readonly options: string[];
        readonly actions: (() => void)[];

        constructor(title: string, className: string, options: string[], actions: (() => void)[], defaultOptionsIndex?: number) {
            this.title = title;
            this.className = className;
            this.options = options;
            this.actions = actions;
            this.defaultOptionsIndex = new Maybe(defaultOptionsIndex);
        }
    }

    const menuOptionInitializers: Maybe<((callback: (update: Game.IUpdate) => void, onNameChange: () => void) => MenuOption)>[] = [
        new Maybe((callback: (update: Game.IUpdate) => void): MenuOption => {
            const gameModes: Game.Mode[] = [Game.Mode.newGame, Game.Mode.specifyName, Game.Mode.selectDifficulty, Game.Mode.highScores, Game.Mode.setTheme];

            return new MenuOption('Endure', 'new-game', ['New Game', 'Set Name', 'Difficulty', 'High Scores', 'Settings'], General.fillArray(gameModes.length, i => () => callback({
                mode: gameModes[i]
            })), 0);
        }),
        new Maybe((callback: (update: Game.IUpdate) => void, onNameChange: () => void): MenuOption => {
            return new MenuOption('Name?', 'player-name', ['Remember it!', 'Forget it.'], [onNameChange, () => callback({
                mode: Game.Mode.newGame
            })], 0);
        }),
        new Maybe((callback: (update: Game.IUpdate) => void): MenuOption => {
            return new MenuOption( 'Grade Level',
                                   'select-difficulty',
                                   ['[ Pre-K ] I made poop.',  '[ K - 5 ] No I don\'t wanna!', '[ 6 - 8 ] Remove the training wheels!', '[ 9 - 12 ] Test me sensei!', '[ 12+ ] I know kung fu.'],
                                   General.fillArray(General.getNumericEnumKeys(App.Difficulty).length, i => () => callback({
                                        difficulty: i as App.Difficulty,
                                        mode: Game.Mode.newGame
                                   })));
        }),
        new Maybe(),
        new Maybe((callback: (update: Game.IUpdate) => void): MenuOption => {
            const gameModes: Game.Mode[] = [Game.Mode.inGame, Game.Mode.newGame];

            return new MenuOption('Game Over', 'game-over', ['Put me in coach!', 'I Quit.'], General.fillArray(gameModes.length, i => () => callback({
                mode: gameModes[i]
            })), 0);
        }),
        new Maybe((callback: (update: Game.IUpdate) => void): MenuOption => {
            const gameModes: Game.Mode[] = [Game.Mode.paused, Game.Mode.newGame];

            return new MenuOption('Timeout', 'paused', ['Put me in coach!', 'I Quit.'], General.fillArray(gameModes.length, i => () => callback({
                mode: gameModes[i]
            })), 0);
        }),
        new Maybe((callback: (update: Game.IUpdate) => void): MenuOption => {
            const gameModes: Game.Mode[] = [Game.Mode.newGame, Game.Mode.inGame];

            return new MenuOption('Quit?', 'quit-confirmation', ['Yep', 'Nope'], General.fillArray(gameModes.length, i => () => callback({
                mode: gameModes[i]
            })), 1);
        }),
        new Maybe((callback: (update: Game.IUpdate) => void): MenuOption => {
            return  new MenuOption('Honor Roll', 'high-scores', ['Leave'], [() => callback({
                mode: Game.Mode.newGame
            })], 0);
        }),
        new Maybe((callback: (update: Game.IUpdate) => void): MenuOption => {
            return new MenuOption('Lights On?', 'theme', ['Yep', 'Nope'], General.fillArray(General.getNumericEnumKeys(App.Theme).length, i => () => callback({
                mode: Game.Mode.newGame,
                theme: i as App.Theme
            })));
        })
    ];

    class Menu {
        readonly menuOptions: Maybe<MenuOption>[];

        getDefaultOptionIndex(props: IProps): number {
            if (props.mode === Game.Mode.selectDifficulty) {
                return props.difficulty;
            }

            if (props.mode === Game.Mode.setTheme) {
                return props.theme === App.Theme.light ? 0 : 1;
            }

            return this.menuOptions[props.mode].caseOf(mo => mo.defaultOptionsIndex.getOrDefault(defaultDefaultOptionsIndex), () => defaultDefaultOptionsIndex);
        }

        constructor(callback: (update: Game.IUpdate) => void, onNameChange: () => void) {
            this.menuOptions = General.fillArray(menuOptionInitializers.length, i => {
                return menuOptionInitializers[i].caseOf(moi => new Maybe(moi(callback, onNameChange)), () => new Maybe() as Maybe<MenuOption>);
            });
        }
    }

    export interface IProps {
        difficulty: App.Difficulty;
        theme: App.Theme;
        mode: Game.Mode;
        highScores: Game.HighScore[];
        playerName: string;
        readonly onUpdate: (updates: Game.IUpdate) => void;
    }

    export class State {
        playerName: string;
        selectedOptionIndex: number;
        readonly menu: Menu;

        constructor(props: IProps, onNameChange: () => void) {
            this.menu = new Menu(props.onUpdate, onNameChange);
            this.playerName = props.playerName;
            this.selectedOptionIndex = this.menu.getDefaultOptionIndex(props);
        }
    }
}