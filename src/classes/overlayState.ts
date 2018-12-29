import { IOverlayProps } from '../interfaces/iOverlayProps';
import { OverlayMenu } from './overlayMenu';

export class OverlayState {
    public playerName: string;
    public selectedOptionIndex: number;
    public readonly menu: OverlayMenu;

    public constructor(props: IOverlayProps, onNameChange: () => void) {
        this.menu = new OverlayMenu(props.onUpdate, onNameChange);
        this.playerName = props.playerName;
        this.selectedOptionIndex = this.menu.getDefaultOptionIndex(props);
    }
}