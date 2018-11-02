import * as React from 'react';
import '../styles/grid.scss';
import { Tile } from './tile';
import { GridBackdrop } from './gridBackdrop';

interface State {
    tiles: Utilities.Grid.Tile[];
    column: number;
    row: number;
};

interface Props {
    view: Utilities.App.View;
    mode: Utilities.Game.Mode;
    readonly onUpdate: (updates: Utilities.Game.Updates) => void;
};

export class Grid extends React.Component<Props, State> {
    readonly state: State;

    private static generateTile(row: number, column: number, colorIndex: number) : Utilities.Grid.Tile {
        return {
            index: row * Utilities.Grid.numberOfTilesHigh + column,
            row: row,
            column: column,
            colorIndex: colorIndex
        };
    };

    private static generateInitialTiles() : Utilities.Grid.Tile[] {
        const tiles: Utilities.Grid.Tile[] = [];

        for (let i = 0; i < Utilities.Grid.numberOfTilesHigh; ++i) {
            for (let j = 0; j < Utilities.Grid.numberOfTilesWide; ++j) {
                tiles.push(this.generateTile(i, j, Utilities.Grid.getRandomColorIndex()));
            }
        }

        return tiles;
    };

    private readonly handleUpdates = (index: number) : void => {

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

    constructor(props: Props) {
        super(props);

        this.state = {
            tiles: Grid.generateInitialTiles(),
            row: 10,
            column: 5
        };
    };

    shouldComponentUpdate(nextProps: Props, nextState: State) : boolean {
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
        const tiles: JSX.Element[] = this.state.tiles.map(tile => <Tile key={tile.index}
                                                                        index={tile.index}
                                                                        colorIndex={tile.colorIndex}
                                                                        row={tile.row}
                                                                        column={tile.column}
                                                                        onUpdate={this.handleUpdates}/>);

        return <div className={'grid' + (Utilities.Game.isInProgress(this.props.mode) ? ' ' : ' hide ') + this.props.view}>
                    <GridBackdrop>
                    </GridBackdrop>
                    {tiles}
               </div>;
    };
};