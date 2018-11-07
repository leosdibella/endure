import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/grid.scss';

import { Tile } from './tile';

interface State {
    tiles: Utilities.Tile.Container[];
    column: number;
    row: number;
    processingInput: boolean;
};

interface Props {
    theme: Utilities.App.Theme;
    orientation: Utilities.App.Orientation;
    mode: Utilities.Game.Mode;
    readonly onUpdate: (updates: Utilities.Game.Updates) => void;
};

export class Grid extends React.PureComponent<Props, State> {
    readonly state: State;

    private removeReducedTiles(reducedTiles: Utilities.Tile.Container[]) : void {
         // TODO: Add Reduction Animations

        if (!Utilities.General.isWellDefinedValue(reducedTiles)) {
            this.setTiles(reducedTiles);
        } else {
            this.setState({
                processingInput: false
            });
        }
    };

    private setTiles = (tiles: Utilities.Tile.Container[], row: number = this.state.row, column: number = this.state.column) : void => {
        const reducedTiles: Utilities.Tile.Container[] = Utilities.Grid.reduceTiles(tiles);

        this.setState({
            processingInput: true,
            row: row,
            column: column,
            tiles: tiles
        }, () => this.removeReducedTiles(reducedTiles));
    };

    private rotateTiles(row: number, column: number) : void {
        const index: number = Utilities.Grid.getTileIndexFromCoordinates(row, column),
              rotatedTiles: Utilities.General.Dictionary<Utilities.Tile.Container> = Utilities.Grid.rotateTiles(this.state.tiles, this.state.tiles[index]);

        // TODO: Add Rotation Animations
        this.setTiles(this.state.tiles.map(t => Utilities.General.isWellDefinedValue(rotatedTiles[t.index]) ? rotatedTiles[t.index] : t));
    };

    private readonly handleUpdates = (row: number, column: number) : void => {
        if (!this.state.processingInput) {
            this.setState({
                processingInput: true,
                column: column,
                row: row,
            }, () => this.rotateTiles(row, column));
        }
    };

    private readonly moveRight = () : void => {
        this.setState({
            column: this.state.column < Utilities.Grid.numberOfTilesWide - 1 ? this.state.column + 1 : 0
        });
    };
    
    private readonly moveLeft = () : void => {
        this.setState({
            column: this.state.column > 0 ? this.state.column - 1 : Utilities.Grid.numberOfTilesWide - 1
        });
    };

    private readonly moveUp = () : void => {
        this.setState({
            row: this.state.row > 0 ? this.state.row - 1 : Utilities.Grid.numberOfTilesHigh - 1
        });
    };

    private readonly moveDown = () : void => {
        this.setState({
            row: this.state.row < Utilities.Grid.numberOfTilesHigh - 1 ? this.state.row + 1 : 0
        });
    };

    private readonly rotateTile = () : void => {
        this.handleUpdates(this.state.row, this.state.column);
    };

    private readonly keyDownEventActionMap: Utilities.General.Dictionary<() => void> = {
        a: this.moveLeft,
        d: this.moveRight,
        w: this.moveUp,
        s: this.moveDown,
        arrowup: this.moveUp,
        arrowdown: this.moveDown,
        arrowleft: this.moveLeft,
        arrowright: this.moveRight,
        ' ': this.rotateTile
    };

    private readonly onKeyDown = (keyboardEvent: KeyboardEvent) : void => {
        if (this.props.mode === Utilities.Game.Mode.inGame) {
            const keyDownHandler: () => void = this.keyDownEventActionMap[keyboardEvent.key.toLocaleLowerCase()];

            if (Utilities.General.isWellDefinedValue(keyDownHandler)) {
                keyDownHandler();
            }
        }
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            tiles: [],
            row: Utilities.Grid.initialRow,
            column: Utilities.Grid.initialColumn,
            processingInput: true
        };
    };

    componentDidMount() : void {
        document.addEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);

        this.setState({
            processingInput: false
        });
    };

    componentWillUnmount() : void {
        document.removeEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    componentDidUpdate(previousProps: Props, previousState: State) : void {
        if (!Utilities.Game.isInProgress(previousProps.mode) && Utilities.Game.isInProgress(this.props.mode)) {
            this.setTiles(Utilities.Tile.generateTileContainers(), Utilities.Grid.initialRow, Utilities.Grid.initialColumn);
        }
    };

    render() : JSX.Element {
        const tiles: JSX.Element[] = this.state.tiles.map(tile => <Tile key={tile.index}
                                                                        mode={this.props.mode}
                                                                        index={tile.index}
                                                                        colorIndex={tile.colorIndex}
                                                                        row={tile.row}
                                                                        column={tile.column}
                                                                        selectedRow={this.state.row}
                                                                        selectedColumn={this.state.column}
                                                                        link={tile.link}
                                                                        onUpdate={this.handleUpdates}/>);

        return <div className={'grid' + (Utilities.Game.isInProgress(this.props.mode) ? ' ' : ' hide ') + this.props.theme}>
                    {tiles}
               </div>;
    };
};