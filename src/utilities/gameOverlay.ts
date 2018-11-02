/// <reference path="Utilities.ts" />
namespace Utilities {
    export namespace GameOverlay {
        export interface Menu {
            title: string;
            className: string;
            defaultOptionsIndex?: number;
            options: string[]
        };

        export const menus: Utilities.GameOverlay.Menu[] = [{
            title: 'Endure',
            className: 'new-game',
            defaultOptionsIndex: 0,
            options: ['New Game', 'Set Name', 'Difficulty', 'High Scores', 'Settings']
        }, {
            title: 'Name?',
            className: 'player-name',
            defaultOptionsIndex: 0,
            options: ['Remember it!', 'Forget it.']
        }, {
            title: 'Grade Level',
            className: 'select-difficulty',
            options: ['[ Pre-K ] I made poop.',  '[ K - 5 ] No I don\'t wanna!', '[ 6 - 8 ] Remove the training wheels!', '[ 9 - 12 ] Test me sensei!', '[ 12+ ] I know kung fu.']
        },
        undefined,
        {
            title: 'Game Over',
            className: 'game-over',
            defaultOptionsIndex: 0,
            options: ['Put me in coach!', 'I Quit.']
        }, {
            title: 'Timeout',
            className: 'paused',
            defaultOptionsIndex: 0,
            options: ['Put me in coach!', 'I Quit.']
        }, {
            title: 'Quit?',
            className: 'quit-confirmation',
            defaultOptionsIndex: 1,
            options: ['Yep', 'Nope']
        }, {
            title: 'Honor Roll',
            className: 'high-scores',
            defaultOptionsIndex: 0,
            options: ['Leave']
        }, {
            title: 'Lights On?',
            className: 'view',
            options: ['Yep', 'Nope']
        }];
    };
};