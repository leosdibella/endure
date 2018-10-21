import * as React from 'react';
import '..//styles/grid.scss';
import { GameUpdates } from './game';
import { Tile, TileProps } from './tile';
import { Utilities } from '../utilities/utilities';

class GridState {
    tiles: TileProps[] = [];
    column: number = 5;
    row: number = 11;

    constructor(tiles: TileProps[]) {
        this.tiles = tiles.map(t => t);
    }
};

export interface GridProps {
    viewMode: Utilities.ViewMode;
    gameMode: Utilities.GameMode;
    readonly onUpdate: (gameUpdates: GameUpdates) => void;
};

export class Grid extends React.Component<GridProps, GridState> {
    readonly state: GridState;

    private static getTileIndex(row: number, column: number) : number {
        return (row * Utilities.Constants.numberOfTilesHigh) + column;
    };

    private readonly handleGridUpdates = (row: number, column: number) : void => {

    };

    private readonly onKeyPress = (keyboardEvent: KeyboardEvent) : void => {
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
                if (this.state.column < Utilities.Constants.numberOfTilesWide - 1) {
                    this.setState({
                        column: this.state.column + 1
                    });
                }

                break;
            }
            default: break;
        }
    };

    private generateTile(row: number, column: number, colors: Utilities.Color[] = undefined) : TileProps {
        return {
            id: `${row}_${column}`,
            row: row,
            column: column,
            colors: colors
        };
    };

    constructor(props: GridProps) {
        super(props);

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
        return nextProps.gameMode !== this.props.gameMode
            || nextProps.viewMode !== this.props.viewMode
            || nextState.column !== this.state.column
            || nextState.row !== this.state.row
            || nextState.tiles !== this.state.tiles;
    };

    componentDidMount() : void {
        document.addEventListener('keypress', this.onKeyPress);
    };

    componentWillUnmount() : void {
        document.removeEventListener('keypress', this.onKeyPress);
    };

    render() : JSX.Element {
        const tiles: JSX.Element[] = this.state.tiles.filter(tile => Utilities.isWellDefinedValue(tile))
                                                     .map(tile => <Tile key={tile.id}
                                                                        id={tile.id}
                                                                        colors={tile.colors}
                                                                        row={tile.row}
                                                                        column={tile.column}
                                                                        onUpdate={this.handleGridUpdates}/>);

        return <div className={'grid-container ' + this.props.viewMode}>
            <div className={'grid ' + (Utilities.isGameInProgress(this.props.gameMode) ? '' : ' hide')}>
                {tiles}
            </div>
        </div>;
    };
};