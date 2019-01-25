import React from 'react';
import { fillArray } from '../utilities/shared';

export class OverlayMenuOption {
    private static generateButtonReferences(numberOfButtons: number): React.RefObject<HTMLButtonElement>[] {
        return fillArray(numberOfButtons, () => {
            return React.createRef();
        });
    }

    public readonly buttonReferences: React.RefObject<HTMLButtonElement>[];

    public constructor(public readonly title: string,
                       public readonly className: string,
                       public readonly options: string[],
                       public readonly actions: (() => void)[],
                       public readonly defaultOptionsIndex?: number) {
        this.buttonReferences = OverlayMenuOption.generateButtonReferences(actions.length);
    }
}