import { Utilities } from './utilities';

export namespace OverlaySettings {
    export interface Option {
        name: string;
        action: () => void;
    };
    
    interface GameMode {
        title: string;
        className: string;
        defaultOptionsIndex: number;
        options: Option[];
    };
    
    export const gameMode: GameMode[] = [{
        title: 'endure',
        className: 'nex-game',
        defaultOptionsIndex: undefined,
        options: undefined
    }, {
        title: 'Select Difficulty',
        className: 'select-difficulty',
        defaultOptionsIndex: 1,
        options: [{
            name: 'Take it easy bud!',
            action: undefined
        }, {
            name: 'Take off the training wheels',
            action: undefined
        }, {
            name: 'Test me sensei',
            action: undefined
        }, {
            name: 'Just wreck my shit please',
            action: undefined
        }]
    },
    undefined,
    {
        title: 'Game Over',
        className: 'game-over',
        defaultOptionsIndex: 0,
        options: [{
            name: 'New Game',
            action: undefined
        }, {
            name: 'Quit',
            action: undefined
        }]
    }, {
        title: 'Paused',
        className: 'paused',
        defaultOptionsIndex: 0,
        options: [{
            name: 'Resume',
            action: undefined
        }, {
            name: 'Quit',
            action: undefined
        }]
    }, {
        title: 'Really Quit?',
        className: 'quit-confirmation',
        defaultOptionsIndex: 1,
        options: [{
            name: 'Yes',
            action: undefined
        }, {
            name: 'No',
            action: undefined
        }]
    }];
    
    interface ViewMode {
        title: string;
        className: string;
    };
    
    export const viewMode: ViewMode[] = [{
        title: 'Light Mode',
        className: Utilities.ViewMode.light
    }, {
        title: 'Dark Mode',
        className: Utilities.ViewMode.dark
    }];
};