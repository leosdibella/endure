import React, { PureComponent } from 'react';
import { ITileProps } from '../interfaces/iTileProps';
import { Boundary, Color, DetonationRange, GameMode, GridMode, TileType } from '../utilities/enum';
import { formatCamelCaseString, getNumericEnumKeys } from '../utilities/shared';

import '../styles/tile.scss';

export class Tile extends PureComponent<ITileProps, object> {
    private static readonly boundaryClasses: string[] = getNumericEnumKeys(Boundary).map(b => `tile-boundary-${formatCamelCaseString(Boundary[b])}`);
    private static readonly tileTypes: string[] = getNumericEnumKeys(TileType).map(tt => `tile-${formatCamelCaseString(TileType[tt])}`);
    private static readonly standardStyles: React.CSSProperties = {};

    private readonly onClick: () => void = this.handleClick.bind(this);

    private getTileType(): TileType {
        if (this.props.gameMode === GameMode.inGame) {
            if (this.props.gridMode === GridMode.ready && this.props.selectedColumn === this.props.container.column && this.props.selectedRow === this.props.container.row) {
                return TileType.highlighted;
            } else {
                return TileType.standard;
            }
        }

        return TileType.obscured;
    }

    private getClassName(tileType: TileType, canBeDetonated: boolean): string {
        return `tile-${Color[this.props.container.color]} ${Tile.tileTypes[tileType]} ${Tile.boundaryClasses[canBeDetonated ? Boundary.all : this.props.container.boundary]}${canBeDetonated ? ' tile-detonation' : ''}`;
    }

    private handleClick(): void {
        this.props.onUpdate(this.props.container.row, this.props.container.column);
    }

    public render(): JSX.Element {
        const tileType: TileType = this.getTileType(),
              canBeDetonated: boolean = this.props.container.detonationRange !== DetonationRange.none && tileType !== TileType.obscured;

        return <div className={this.getClassName(tileType, canBeDetonated)}
                    style={this.props.gameMode === GameMode.paused ? Tile.standardStyles : this.props.additionalStyles}
                    onClick={this.onClick}>
                   {canBeDetonated ? <span className='tile-detonation-value'>
                                        {this.props.container.detonationRange}
                                     </span>
                                   : undefined}
               </div>;
    }
}