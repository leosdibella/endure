import { IAppUpdate } from './iAppUpdate';
import { IBackdropProps } from './iBackdropProps';

export interface IGameProps extends IBackdropProps {
    onUpdate(updates: IAppUpdate): void;
}