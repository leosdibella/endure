import * as React from 'react';
import * as Shared from '../utilities/shared';

export class OverlayMenuOption {
    private static generateButtonReferences(numberOfButtons: number): React.RefObject<HTMLButtonElement>[] {
        return Shared.fillArray(numberOfButtons, () => {
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