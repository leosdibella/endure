import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/tile.scss';

interface Props {
    colorIndex: number;
    index: number;
    row: number;
    column: number;
    mode: Utilities.Game.Mode;
    isSelected: boolean;
    onUpdate: (row: number, column: number) => void;
};

export class Tile extends React.PureComponent<Props, object> {
    constructor(props: Props) {
        super(props);
    };

    private getClassName() : string {
        if (this.props.mode === Utilities.Game.Mode.inGame && Utilities.General.isWellDefinedValue(this.props.colorIndex)) {
            return 'tile-' + Utilities.Grid.colors[this.props.colorIndex] + (this.props.isSelected ? ' tile-selected' : '');
        }

        return 'tile';
    };

    private getStyle() : Utilities.General.CssStyle {
        const placementModifier: number = this.props.isSelected && this.props.mode === Utilities.Game.Mode.inGame ? -Utilities.Tile.selectedPlacementModifier : 0,
              dimension: string = Utilities.Tile.dimension + (this.props.isSelected && this.props.mode === Utilities.Game.Mode.inGame ? Utilities.Tile.selectedDimensionModifier : 0) + 'px';

        return {
            top: (this.props.row * (Utilities.Tile.dimensionWithMargin)) + placementModifier + 'px',
            left: (this.props.column * (Utilities.Tile.dimensionWithMargin)) + placementModifier + 'px',
            height: dimension,
            width: dimension,
        };
    };

    private readonly onClick = (event: React.MouseEvent<HTMLDivElement>) : void => {
        this.props.onUpdate(this.props.row, this.props.column);
    };

    render() : JSX.Element {
        return <div className={this.getClassName()}
                    style={this.getStyle()}
                    onClick={this.onClick}>
               </div>;
    };
};