import { App } from './app';
import { Game } from './game';
import { Maybe } from './maybe';

export namespace GameOverlay {
    export const defaultDefaultOptionsIndex: number = 0;

    class MenuOption {
        readonly title: string;
        readonly className: string;
        readonly defaultOptionsIndex: Maybe<number>;
        readonly options: string[];
        readonly actions: (() => void)[];

        constructor(title: string, className: string, options: string[], defaultOptionsIndex?: number) {
            this.title = title;
            this.className = className;
            this.options = options;
            this.actions = [];
            this.defaultOptionsIndex = new Maybe(defaultOptionsIndex);
        };
    };

    const menuOptionInitializers: Maybe<((callback: (update: Game.IUpdate) => void, onNameChange: () => void) => MenuOption)>[] = [
        new Maybe((callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Endure', 'new-game', ['New Game', 'Set Name', 'Difficulty', 'High Scores', 'Settings'], 0),
                  gameModes: Game.Mode[] = [Game.Mode.newGame, Game.Mode.specifyName, Game.Mode.selectDifficulty, Game.Mode.highScores, Game.Mode.setTheme];

            for (let i: number = 0; i < gameModes.length; ++i) {
                menuOption.actions.push(() => callback({
                    mode: gameModes[i]
                }));
            }

            return menuOption;
        }),
        new Maybe((callback: (update: Game.IUpdate) => void, onNameChange: () => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Name?', 'player-name', ['Remember it!', 'Forget it.'], 0);

            menuOption.actions.push(onNameChange);

            menuOption.actions.push(() => callback({
                mode: Game.Mode.newGame
            }));

            return menuOption;
        }),
        new Maybe((callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption( 'Grade Level', 'select-difficulty', ['[ Pre-K ] I made poop.',  '[ K - 5 ] No I don\'t wanna!', '[ 6 - 8 ] Remove the training wheels!', '[ 9 - 12 ] Test me sensei!', '[ 12+ ] I know kung fu.']),
                  difficulties: string[] = Object.keys(Game.Difficulty);

            for (let i: number = 0; i < difficulties.length; ++i) {
                menuOption.actions.push(() => callback({
                    mode: Game.Mode.newGame,
                    difficulty: i as Game.Difficulty
                }));
            }

            return menuOption;
        }),
        new Maybe(),
        new Maybe((callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Game Over', 'game-over', ['Put me in coach!', 'I Quit.'], 0),
                  gameModes: Game.Mode[] = [Game.Mode.inGame, Game.Mode.newGame];

            for (let i: number = 0; i < gameModes.length; ++i) {
                menuOption.actions.push(() => callback({
                    mode: gameModes[i]
                }));
            }

            return menuOption;
        }),
        new Maybe((callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Timeout', 'paused', ['Put me in coach!', 'I Quit.'], 0),
                  gameModes: Game.Mode[] = [Game.Mode.paused, Game.Mode.newGame];

            for (let i: number = 0; i < gameModes.length; ++i) {
                menuOption.actions.push(() => callback({
                    mode: gameModes[i]
                }));
            }

            return menuOption;
        }),
        new Maybe((callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Quit?', 'quit-confirmation', ['Yep', 'Nope'], 1),
                  gameModes: Game.Mode[] = [Game.Mode.newGame, Game.Mode.inGame];

            for (let i: number = 0; i < gameModes.length; ++i) {
                menuOption.actions.push(() => callback({
                    mode: gameModes[i]
                }));
            }

            return menuOption;
        }),
        new Maybe((callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Honor Roll', 'high-scores', ['Leave'], 0);

            menuOption.actions.push(() => callback({
                mode: Game.Mode.newGame
            }));

            return menuOption;
        }),
        new Maybe((callback: (update: Game.IUpdate) => void) : MenuOption => {
            const menuOption: MenuOption = new MenuOption('Lights On?', 'theme', ['Yep', 'Nope']),
                  themes: string[] = Object.keys(App.Theme);

            for (let i: number = 0; i < themes.length; ++i) {
                menuOption.actions.push(() => callback({
                    mode: Game.Mode.newGame,
                    theme: i as App.Theme
                }));
            }

            return menuOption;
        })
    ];

    class Menu {
        readonly menuOptions: Maybe<MenuOption>[];

        constructor(callback: (update: Game.IUpdate) => void, onNameChange: () => void) {
            this.menuOptions = [];

            for (let i: number = 0; i < menuOptionInitializers.length; ++i) {
                this.menuOptions.push(menuOptionInitializers[i].caseOf(moi => new Maybe(moi(callback, onNameChange)), () => new Maybe() as Maybe<MenuOption>));
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
            this.selectedOptionIndex = selectedOptionIndex;
        };
    };

    export interface IProps {
        difficulty: Game.Difficulty;
        theme: App.Theme;
        mode: Game.Mode;
        highScores: Game.HighScore[];
        playerName: string;
        readonly onUpdate: (updates: Game.IUpdate) => void;
    };
};