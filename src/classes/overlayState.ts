import * as React from 'react';
import { IHighScore } from '../interfaces/iHighScore';
import { IOverlayMenuOption } from '../interfaces/iOverlayMenuOption';
import { IOverlayProps } from '../interfaces/iOverlayProps';
import { Difficulty, HighScoreListing } from '../utilities/enum';
import * as Shared from '../utilities/shared';
import { OverlayMenu } from './overlayMenu';

export class OverlayState {
    public globalHighScores: IHighScore[];
    public highScoreDifficulty: Difficulty;
    public highScoreListing: HighScoreListing;
    public playerName: string;
    public waiting: boolean;
    public noConnectivity: boolean;
    public selectedOptionIndex: number;
    public readonly menu: OverlayMenu;
    public readonly buttonReferences: React.RefObject<HTMLButtonElement>[][];

    public constructor(props: IOverlayProps, onNameChange: () => void) {
        this.menu = new OverlayMenu(props.onUpdate, onNameChange);
        this.playerName = props.playerName;
        this.selectedOptionIndex = this.menu.getDefaultOptionIndex(props);
        this.waiting = false;
        this.globalHighScores = [];
        this.highScoreListing = HighScoreListing.local;
        this.highScoreDifficulty = props.difficulty;
        this.noConnectivity = false;

        this.buttonReferences = Shared.fillArray(this.menu.menuOptions.length, i => {
            if (Shared.isDefined(this.menu.menuOptions[i])) {
                const menuOption: IOverlayMenuOption = this.menu.menuOptions[i] as IOverlayMenuOption;

                return Shared.fillArray(menuOption.actions.length, j => {
                    return React.createRef();
                });
            }

            return [];
        });

        React.createRef();
    }
}