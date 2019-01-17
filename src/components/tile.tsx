import * as React from 'react';
import { IDictionary } from '../interfaces/iDictionary';
import { ITileProps } from '../interfaces/iTileProps';
import { Boundary, Color, DetonationRange, GameMode, GridMode, TileType } from '../utilities/enum';
import { centralRotationMap } from '../utilities/rotation';
import * as Shared from '../utilities/shared';

import '../styles/tile.scss';

export class Tile extends React.PureComponent<ITileProps, object> {
    private static readonly dimensionMultiplier: number = 2;
    private static readonly dimension: number = 50;
    private static readonly highlightedMargin: number = 3;
    private static readonly highlightedPadding: number = 5;
    private static readonly highlightedNeighborMargin: number = 1;
    private static readonly highlightedNeighborPadding: number = 1;
    private static readonly boundaryClasses: string[] = Shared.getNumericEnumKeys(Boundary).map(b => `tile-boundary-${Shared.formatCamelCaseString(Boundary[b])}`);
    private static readonly tileTypes: string[] = Shared.getNumericEnumKeys(TileType).map(tt => `tile-${Shared.formatCamelCaseString(TileType[tt])}`);

    private static readonly layoutModifiers: IDictionary<number> = {
        [TileType.standard]: 0,
        [TileType.obscured]: 0,
        [TileType.highlighted]: Tile.highlightedMargin + Tile.highlightedPadding,
        [TileType.highlightedNeighbor]: Tile.highlightedNeighborMargin + Tile.highlightedNeighborPadding
    };

    public static readonly dimensionWithMargin: number = Tile.dimension + Tile.highlightedMargin;

    private readonly onClick: () => void = this.handleClick.bind(this);

    private getTileType(): TileType {
        let tileType: TileType = TileType.obscured;

        if (this.props.gameMode === GameMode.inGame) {
            if (this.props.gridMode === GridMode.ready) {
                if (this.props.selectedColumn === this.props.container.column && this.props.selectedRow === this.props.container.row) {
                    tileType = TileType.highlighted;
                } else {
                    tileType = centralRotationMap.filter(coordinates => {
                        return coordinates[0] + this.props.selectedRow === this.props.container.row && coordinates[1] + this.props.selectedColumn === this.props.container.column;
                    }).length > 0 ? TileType.highlightedNeighbor : TileType.standard;
                }
            } else {
                tileType = TileType.standard;
            }
        }

        return tileType;
    }

    private getClassName(tileType: TileType): string {
        return `tile-${Color[this.props.container.color]} ${Tile.tileTypes[tileType]} ${Tile.boundaryClasses[this.props.container.boundary]}`;
    }

    private getStyle(tileType: TileType): React.CSSProperties {
        const placementModifier: number = Tile.layoutModifiers[tileType],
              dimension: string = `${Tile.dimension + (Tile.dimensionMultiplier * placementModifier)}px`;

        return {
            borderRadius: this.props.additionalStyles.borderRadius,
            height: dimension,
            left: `${(this.props.container.column * Tile.dimensionWithMargin) - placementModifier}px`,
            opacity: this.props.additionalStyles.opacity,
            top: `${(this.props.container.row * Tile.dimensionWithMargin) - placementModifier}px`,
            width: dimension
        };
    }

    private handleClick(): void {
        this.props.onUpdate(this.props.container.row, this.props.container.column);
    }

    public render(): JSX.Element {
        const tileType: TileType = this.getTileType();

        return <div className={this.getClassName(tileType)}
                    style={this.getStyle(tileType)}
                    onClick={this.onClick}>
                    {this.props.container.detonationRange !== DetonationRange.none ? this.props.container.detonationRange : ''}
               </div>;
    }
}