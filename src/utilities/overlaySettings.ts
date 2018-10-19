import { Utilities } from './utilities';

export namespace OverlaySettings {
    export interface Option {
        name: string;
        action?: () => void;
    };
    
    interface GameMode {
        title: string;
        className: string;
        defaultOptionsIndex: number;
        options: Option[];
    };
    
    export const gameMode: GameMode[] = [{
        title: 'endure',
        className: 'new-game',
        defaultOptionsIndex: 0,
        options: [{
            name: 'New Game'
        }, {
            name: 'Select Difficulty'
        }, {
            name: 'View High Scores'
        }]
    }, {
        title: 'Select Difficulty',
        className: 'select-difficulty',
        defaultOptionsIndex: 1,
        options: [{
            name: 'Take it easy bud!'
        }, {
            name: 'Take off the training wheels'
        }, {
            name: 'Test me sensei'
        }, {
            name: 'Just wreck my shit please'
        }]
    },
    undefined,
    {
        title: 'Game Over',
        className: 'game-over',
        defaultOptionsIndex: 0,
        options: [{
            name: 'New Game'
        }, {
            name: 'Quit'
        }]
    }, {
        title: 'Paused',
        className: 'paused',
        defaultOptionsIndex: 0,
        options: [{
            name: 'Resume'
        }, {
            name: 'Quit'
        }]
    }, {
        title: 'Really Quit?',
        className: 'quit-confirmation',
        defaultOptionsIndex: 1,
        options: [{
            name: 'Yes'
        }, {
            name: 'No'
        }]
    }, {
        title: 'High Scores',
        className: 'high-scores',
        defaultOptionsIndex: 0,
        options: [{
            name: 'Exit'
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