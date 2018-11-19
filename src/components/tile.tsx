import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/tile.scss';

export class Tile extends React.PureComponent<Utilities.Tile.IProps, object> {
    private getClassName(additionalClass: string) : string {
        let className: string = 'tile';

        if (this.props.mode === Utilities.Game.Mode.inGame) {
            className += '-';
            className += Utilities.General.isWellDefinedValue(this.props.color) ? Utilities.Tile.Color[this.props.color] : 'transparent';
            className += ' '
            className += additionalClass;
            className += ' '
            className += Utilities.Tile.linkClasses[this.props.link];
        }

        return className;
    };

    private getStyle(additionalClass: string) : Utilities.General.ICssStyle {
        const placementModifier: number = additionalClass && this.props.mode === Utilities.Game.Mode.inGame ? -Utilities.Tile.selectedPlacementModifier : 0,
              dimension: string = Utilities.Tile.dimension + (additionalClass && this.props.mode === Utilities.Game.Mode.inGame ? Utilities.Tile.selectedDimensionModifier : 0) + 'px';

        return {
            top: (this.props.row * (Utilities.Tile.dimensionWithMargin)) + placementModifier + 'px',
            left: (this.props.column * (Utilities.Tile.dimensionWithMargin)) + placementModifier + 'px',
            height: dimension,
            width: dimension
        };
    };

    private getAdditionalClass() : string {
        let additionalClass: string = '';

        return additionalClass;
    };

    private readonly onClick = (event: React.MouseEvent<HTMLDivElement>) : void => {
        this.props.onUpdate(this.props.row, this.props.column);
    };

    render() : JSX.Element {
        const additionalClass: string = this.getAdditionalClass();

        return <div className={this.getClassName(additionalClass)}
                    style={this.getStyle(additionalClass)}
                    onClick={this.onClick}>
               </div>;
    };
};