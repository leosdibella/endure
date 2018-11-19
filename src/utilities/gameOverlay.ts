import { App } from './app';
import { Game } from './game';
import { General } from './utilities';

export namespace GameOverlay {
    class MenuOption {
        readonly title: string;
        readonly className: string;
        readonly defaultOptionsIndex?: number;
        readonly options: string[];
        readonly actions: (() => void)[];

        constructor(title: string, className: string, defaultOptionsIndex: number, options: string[]) {
            this.title = title;
            this.className = className;
            this.options = options;
            this.actions = [];
            this.defaultOptionsIndex = defaultOptionsIndex;
        };
    };

    const menuOptionInitializers: ((callback: (update: Game.IUpdate) => void, onNameChange: () => void) => MenuOption)[] = [
        (callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Endure', 'new-game', 0, ['New Game', 'Set Name', 'Difficulty', 'High Scores', 'Settings']),
                  gameModes: Game.Mode[] = [Game.Mode.newGame, Game.Mode.specifyName, Game.Mode.selectDifficulty, Game.Mode.highScores, Game.Mode.setTheme];

            for (let i: number = 0; i < gameModes.length; ++i) {
                menuOption.actions.push(() => callback({
                    mode: gameModes[i]
                }));
            }

            return menuOption;
        },
        (callback: (update: Game.IUpdate) => void, onNameChange: () => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Name?', 'player-name', 0, ['Remember it!', 'Forget it.']);

            menuOption.actions.push(onNameChange);

            menuOption.actions.push(() => callback({
                mode: Game.Mode.newGame
            }));

            return menuOption;
        },
        (callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption( 'Grade Level', 'select-difficulty', undefined, ['[ Pre-K ] I made poop.',  '[ K - 5 ] No I don\'t wanna!', '[ 6 - 8 ] Remove the training wheels!', '[ 9 - 12 ] Test me sensei!', '[ 12+ ] I know kung fu.']),
                  difficulties: string[] = Object.keys(Game.Difficulty);

            for (let i: number = 0; i < difficulties.length; ++i) {
                menuOption.actions.push(() => callback({
                    mode: Game.Mode.newGame,
                    difficulty: i as Game.Difficulty
                }));
            }

            return menuOption;
        },
        (callback: (update: Game.IUpdate) => void) : MenuOption => {
            return undefined;
        },
        (callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Game Over', 'game-over', 0, ['Put me in coach!', 'I Quit.']),
                  gameModes: Game.Mode[] = [Game.Mode.inGame, Game.Mode.newGame];

            for (let i: number = 0; i < gameModes.length; ++i) {
                menuOption.actions.push(() => callback({
                    mode: gameModes[i]
                }));
            }

            return menuOption;
        },
        (callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Timeout', 'paused', 0, ['Put me in coach!', 'I Quit.']),
                  gameModes: Game.Mode[] = [Game.Mode.paused, Game.Mode.newGame];

            for (let i: number = 0; i < gameModes.length; ++i) {
                menuOption.actions.push(() => callback({
                    mode: gameModes[i]
                }));
            }

            return menuOption;
        },
        (callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Quit?', 'quit-confirmation', 1, ['Yep', 'Nope']),
                  gameModes: Game.Mode[] = [Game.Mode.newGame, Game.Mode.inGame];

            for (let i: number = 0; i < gameModes.length; ++i) {
                menuOption.actions.push(() => callback({
                    mode: gameModes[i]
                }));
            }

            return menuOption;
        },
        (callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Honor Roll', 'high-scores', 0, ['Leave']);

            menuOption.actions.push(() => callback({
                mode: Game.Mode.newGame
            }));

            return menuOption;
        },
        (callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Lights On?', 'theme', undefined, ['Yep', 'Nope']),
                  themes: string[] = Object.keys(App.Theme);

            for (let i: number = 0; i < themes.length; ++i) {
                menuOption.actions.push(() => callback({
                    mode: Game.Mode.newGame,
                    theme: i as App.Theme
                }));
            }

            return menuOption;
        }
    ];

    class Menu {
        readonly menuOptions: MenuOption[];

        constructor(callback: (update: Game.IUpdate) => void, onNameChange: () => void) {
            this.menuOptions = [];

            for (let i: number = 0; i < menuOptionInitializers.length; ++i) {
                this.menuOptions.push(menuOptionInitializers[i](callback, onNameChange));
            }
        };
    };

    export class State {
        playerName: string;
        selectedOptionIndex: number;
        readonly menu: Menu;

        constructor(playerName: string, selectedOptionIndex: number, menuCallback: (update: Game.IUpdate) => void, onNameChange: () => void) {
            this.menu = new Menu(menuCallback, onNameChange);
            this.playerName = playerName;
            this.selectedOptionIndex = General.castSafeOr(selectedOptionIndex, 0);
        };
    };

    export interface IProps {
        difficulty: Game.Difficulty;
        theme: App.Theme;
        mode: Game.Mode;
        highScores: Game.IHighScore[];
        playerName: string;
        readonly onUpdate: (updates: Game.IUpdate) => void;
    };
};