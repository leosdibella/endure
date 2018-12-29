import * as React from 'react';
import { TileContainer } from '../classes/tileContainer';
import { ICssStyle } from '../interfaces/iCssStyle';
import { ITileProps } from '../interfaces/iTileProps';
import { Color, DetonationRange, GameMode } from '../utilities/enum';

import '../styles/tile.scss';

export class Tile extends React.PureComponent<ITileProps, object> {
    private readonly onClick: () => void = this.handleClick.bind(this);

    private getClassName(): string {
        let className: string = 'tile';

        if (this.props.gameMode === GameMode.inGame) {
            className += `-${Color[this.props.container.color]} ${this.props.additionalClassName} ${TileContainer.boundaryClasses[this.props.container.boundary]}`;
        }

        return className;
    }

    private getStyle(): ICssStyle {
        const placementModifier: number = this.props.additionalClassName && this.props.gameMode === GameMode.inGame ? -TileContainer.selectedPlacementModifier : 0,
              dimension: string = `${TileContainer.dimension + (this.props.additionalClassName && this.props.gameMode === GameMode.inGame ? TileContainer.selectedDimensionModifier : 0)}px`;

        return {
            height: dimension,
            left: `${(this.props.container.column * (TileContainer.dimensionWithMargin)) + placementModifier}px`,
            top: `${(this.props.container.row * (TileContainer.dimensionWithMargin)) + placementModifier}px`,
            width: dimension
        };
    }

    private handleClick(): void {
        this.props.onUpdate(this.props.container.row, this.props.container.column);
    }

    public render(): JSX.Element {
        return <div className={this.getClassName()}
                    style={this.getStyle()}
                    onClick={this.onClick}>
                    {this.props.container.detonationRange !== DetonationRange.none ? this.props.container.detonationRange : ''}
               </div>;
    }
}