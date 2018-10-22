import * as React from 'react';
import '..//styles/grid.scss';
import { GameUpdates } from './game';
import { Tile, TileProps } from './tile';
import { Utilities } from '../utilities/utilities';

interface GridState {
    tiles: TileProps[];
    column: number;
    row: number;
};

export interface GridProps {
    view: Utilities.App.View;
    mode: Utilities.Game.Mode;
    readonly onUpdate: (gameUpdates: GameUpdates) => void;
};

export class Grid extends React.Component<GridProps, GridState> {
    readonly state: GridState;

    private static getTileIndex(row: number, column: number) : number {
        return (row * Utilities.Grid.numberOfTilesHigh) + column;
    };

    private readonly handleGridUpdates = (row: number, column: number) : void => {

    };

    private readonly onKeyDown = (keyboardEvent: KeyboardEvent) : void => {
        switch (keyboardEvent.key.toUpperCase()) {
            case 'A': {
                if (this.state.column > 0) {
                    this.setState({
                        column: this.state.column - 1
                    });
                }

                break;
            }
            case 'D': {
                if (this.state.column < Utilities.Grid.numberOfTilesWide - 1) {
                    this.setState({
                        column: this.state.column + 1
                    });
                }

                break;
            }
            default: break;
        }
    };

    private generateTile(row: number, column: number, colors: Utilities.Grid.Color[] = undefined) : TileProps {
        return {
            id: `${row}_${column}`,
            row: row,
            column: column,
            colors: colors
        };
    };

    constructor(props: GridProps) {
        super(props);

        this.state = {
            tiles: [],
            row: 10,
            column: 5
        };

        /*this.updateTile(0, 0, [Utilities.Color.blue, Utilities.Color.green]);
        this.updateTile(1, 0, [Utilities.Color.green, Utilities.Color.orange]);
        this.updateTile(3, 0, [Utilities.Color.violet, Utilities.Color.green]);
        this.updateTile(3, 1, [Utilities.Color.red, Utilities.Color.blue]);
        this.updateTile(3, 2, [Utilities.Color.yellow, Utilities.Color.blue]);
        this.updateTile(3, 3, [Utilities.Color.yellow, Utilities.Color.green]);
        this.updateTile(4, 0, [Utilities.Color.orange, Utilities.Color.violet]);
        this.updateTile(4, 3, [Utilities.Color.yellow, Utilities.Color.violet]);*/
    };

    shouldComponentUpdate(nextProps: GridProps, nextState: GridState) : boolean {
        return nextProps.mode !== this.props.mode
            || nextProps.view !== this.props.view
            || nextState.column !== this.state.column
            || nextState.row !== this.state.row
            || nextState.tiles !== this.state.tiles;
    };

    componentDidMount() : void {
        document.addEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    componentWillUnmount() : void {
        document.removeEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    render() : JSX.Element {
        const tiles: JSX.Element[] = this.state.tiles.filter(tile => Utilities.General.isWellDefinedValue(tile))
                                                     .map(tile => <Tile key={tile.id}
                                                                        id={tile.id}
                                                                        colors={tile.colors}
                                                                        row={tile.row}
                                                                        column={tile.column}
                                                                        onUpdate={this.handleGridUpdates}/>);

        return <div className={'grid-container ' + this.props.view}>
                   <div className={'grid ' + (Utilities.Game.isInProgress(this.props.mode) ? '' : ' hide')}>
                       {tiles}
                   </div>
               </div>;
    };
};