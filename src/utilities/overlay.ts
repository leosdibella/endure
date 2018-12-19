import * as AppUtilities from './app';
import * as GameUtilities from './game';
import * as GeneralUtilities from './general';
import { Maybe } from './maybe';

const defaultDefaultOptionsIndex: number = 0;

class MenuOption {
    public readonly title: string;
    public readonly className: string;
    public readonly defaultOptionsIndex: Maybe<number>;
    public readonly options: string[];
    public readonly actions: (() => void)[];

    public constructor(title: string, className: string, options: string[], actions: (() => void)[], defaultOptionsIndex?: number) {
        this.title = title;
        this.className = className;
        this.options = options;
        this.actions = actions;
        this.defaultOptionsIndex = new Maybe(defaultOptionsIndex);
    }
}

const menuOptionInitializers: Maybe<((callback: (update: GameUtilities.IUpdate) => void, onNameChange: () => void) => MenuOption)>[] = [
    new Maybe((callback: (update: GameUtilities.IUpdate) => void): MenuOption => {
        const gameModes: GameUtilities.Mode[] = [
            GameUtilities.Mode.inGame,
            GameUtilities.Mode.specifyName,
            GameUtilities.Mode.selectDifficulty,
            GameUtilities.Mode.highScores,
            GameUtilities.Mode.setTheme
        ];

        return new MenuOption('Endure', 'new-game', ['New Game', 'Set Name', 'Difficulty', 'High Scores', 'Settings'], GeneralUtilities.fillArray(gameModes.length, i => () => callback({
            mode: gameModes[i]
        })), 0);
    }),
    new Maybe((callback: (update: GameUtilities.IUpdate) => void, onNameChange: () => void): MenuOption => {
        return new MenuOption('Name?', 'player-name', ['Remember it!', 'Forget it.'], [onNameChange, () => callback({
            mode: GameUtilities.Mode.newGame
        })], 0);
    }),
    new Maybe((callback: (update: GameUtilities.IUpdate) => void): MenuOption => {
        return new MenuOption( 'Grade Level',
                                'select-difficulty',
                                ['[ Pre-K ] I made poop.',  '[ K - 5 ] No I don\'t wanna!', '[ 6 - 8 ] Remove the training wheels!', '[ 9 - 12 ] Test me sensei!', '[ 12+ ] I know kung fu.'],
                                GeneralUtilities.fillArray(GeneralUtilities.getNumericEnumKeys(AppUtilities.Difficulty).length, i => () => callback({
                                    difficulty: i as AppUtilities.Difficulty,
                                    mode: GameUtilities.Mode.newGame
                                })));
    }),
    new Maybe(),
    new Maybe((callback: (update: GameUtilities.IUpdate) => void): MenuOption => {
        const gameModes: GameUtilities.Mode[] = [GameUtilities.Mode.inGame, GameUtilities.Mode.newGame];

        return new MenuOption('Game Over', 'game-over', ['Put me in coach!', 'I Quit.'], GeneralUtilities.fillArray(gameModes.length, i => () => callback({
            mode: gameModes[i]
        })), 0);
    }),
    new Maybe((callback: (update: GameUtilities.IUpdate) => void): MenuOption => {
        const gameModes: GameUtilities.Mode[] = [GameUtilities.Mode.paused, GameUtilities.Mode.newGame];

        return new MenuOption('Timeout', 'paused', ['Put me in coach!', 'I Quit.'], GeneralUtilities.fillArray(gameModes.length, i => () => callback({
            mode: gameModes[i]
        })), 0);
    }),
    new Maybe((callback: (update: GameUtilities.IUpdate) => void): MenuOption => {
        const gameModes: GameUtilities.Mode[] = [GameUtilities.Mode.newGame, GameUtilities.Mode.inGame];

        return new MenuOption('Quit?', 'quit-confirmation', ['Yep', 'Nope'], GeneralUtilities.fillArray(gameModes.length, i => () => callback({
            mode: gameModes[i]
        })), 1);
    }),
    new Maybe((callback: (update: GameUtilities.IUpdate) => void): MenuOption => {
        return  new MenuOption('Honor Roll', 'high-scores', ['Leave'], [() => callback({
            mode: GameUtilities.Mode.newGame
        })], 0);
    }),
    new Maybe((callback: (update: GameUtilities.IUpdate) => void): MenuOption => {
        return new MenuOption('Lights On?', 'theme', ['Yep', 'Nope'], GeneralUtilities.fillArray(GeneralUtilities.getNumericEnumKeys(AppUtilities.Theme).length, i => () => callback({
            mode: GameUtilities.Mode.newGame,
            theme: i as AppUtilities.Theme
        })));
    })
];

class Menu {
    public readonly menuOptions: Maybe<MenuOption>[];

    public getDefaultOptionIndex(props: IProps): number {
        if (props.mode === GameUtilities.Mode.selectDifficulty) {
            return props.difficulty;
        }

        if (props.mode === GameUtilities.Mode.setTheme) {
            return props.theme === AppUtilities.Theme.light ? 0 : 1;
        }

        return this.menuOptions[props.mode].caseOf(mo => mo.defaultOptionsIndex.getOrDefault(defaultDefaultOptionsIndex), () => defaultDefaultOptionsIndex);
    }

    public constructor(callback: (update: GameUtilities.IUpdate) => void, onNameChange: () => void) {
        this.menuOptions = GeneralUtilities.fillArray(menuOptionInitializers.length, i => {
            return menuOptionInitializers[i].caseOf(moi => new Maybe(moi(callback, onNameChange)), () => new Maybe() as Maybe<MenuOption>);
        });
    }
}

interface IProps {
    difficulty: AppUtilities.Difficulty;
    theme: AppUtilities.Theme;
    mode: GameUtilities.Mode;
    highScores: GameUtilities.HighScore[];
    playerName: string;
    readonly onUpdate: (updates: GameUtilities.IUpdate) => void;
}

class State {
    public playerName: string;
    public selectedOptionIndex: number;
    public readonly menu: Menu;

    public constructor(props: IProps, onNameChange: () => void) {
        this.menu = new Menu(props.onUpdate, onNameChange);
        this.playerName = props.playerName;
        this.selectedOptionIndex = this.menu.getDefaultOptionIndex(props);
    }
}

export {
    IProps,
    State
};