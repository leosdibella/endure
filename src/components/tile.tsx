import * as React from 'react';

import * as GameUtilities from '../utilities/game';
import * as GeneralUtilities from '../utilities/general';
import * as TileUtilities from '../utilities/tile';

import '../styles/tile.scss';

class Tile extends React.PureComponent<TileUtilities.IProps, object> {
    private readonly onClick: () => void = this.handleClick.bind(this);

    private getClassName(additionalClass: string): string {
        let className: string = 'tile';

        if (this.props.mode === GameUtilities.Mode.inGame) {
            className += '-';
            className += TileUtilities.Color[this.props.color];
            className += ' ';
            className += additionalClass;
            className += ' ';
            className += TileUtilities.linkClasses[this.props.link];
        }

        return className;
    }

    private getStyle(additionalClass: string): GeneralUtilities.ICssStyle {
        const placementModifier: number = additionalClass && this.props.mode === GameUtilities.Mode.inGame ? -TileUtilities.selectedPlacementModifier : 0,
              dimension: string = TileUtilities.dimension + (additionalClass && this.props.mode === GameUtilities.Mode.inGame ? TileUtilities.selectedDimensionModifier : 0) + 'px';

        return {
            height: dimension,
            left: (this.props.column * (TileUtilities.dimensionWithMargin)) + placementModifier + 'px',
            top: (this.props.row * (TileUtilities.dimensionWithMargin)) + placementModifier + 'px',
            width: dimension
        };
    }

    private getAdditionalClass(): string {
        const additionalClass: string = '';

        return additionalClass;
    }

    private handleClick(): void {
        this.props.onUpdate(this.props.row, this.props.column);
    }

    public render(): JSX.Element {
        const additionalClass: string = this.getAdditionalClass();

        return <div className={this.getClassName(additionalClass)}
                    style={this.getStyle(additionalClass)}
                    onClick={this.onClick}>
                    {this.props.detonationRange !== TileUtilities.DetonationRange.none ? this.props.detonationRange : ''}
               </div>;
    }
}

export {
    Tile
};