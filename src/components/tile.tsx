import * as React from 'react';

import * as GameUtilities from '../utilities/game';
import * as Shared from '../utilities/shared';
import * as TileUtilities from '../utilities/tile';

import '../styles/tile.scss';

class Tile extends React.PureComponent<TileUtilities.IProps, object> {
    private readonly onClick: () => void = this.handleClick.bind(this);

    private getClassName(): string {
        let className: string = 'tile';

        if (this.props.mode === GameUtilities.Mode.inGame) {
            className += `-${TileUtilities.Color[this.props.color]} ${this.props.additionalClassName} ${TileUtilities.Container.linkClasses[this.props.link]}`;
        }

        return className;
    }

    private getStyle(): Shared.ICssStyle {
        const placementModifier: number = this.props.additionalClassName && this.props.mode === GameUtilities.Mode.inGame ? -TileUtilities.Container.selectedPlacementModifier : 0,
              dimension: string = `${TileUtilities.Container.dimension + (this.props.additionalClassName && this.props.mode === GameUtilities.Mode.inGame ? TileUtilities.Container.selectedDimensionModifier : 0)}px`;

        return {
            height: dimension,
            left: `${(this.props.column * (TileUtilities.Container.dimensionWithMargin)) + placementModifier}px`,
            top: `${(this.props.row * (TileUtilities.Container.dimensionWithMargin)) + placementModifier}px`,
            width: dimension
        };
    }

    private handleClick(): void {
        this.props.onUpdate(this.props.row, this.props.column);
    }

    public render(): JSX.Element {
        return <div className={this.getClassName()}
                    style={this.getStyle()}
                    onClick={this.onClick}>
                    {this.props.detonationRange !== TileUtilities.DetonationRange.none ? this.props.detonationRange : ''}
               </div>;
    }
}

export {
    Tile
};