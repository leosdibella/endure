import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/grid.scss';

import { Tile } from './tile';

export class Grid extends React.PureComponent<Utilities.Grid.IProps, Utilities.Grid.State> {
    readonly state: Utilities.Grid.State = new Utilities.Grid.State();

    private removeReducedTiles(reduction: Utilities.Grid.Reduction) : void {
         // TODO: Add Reduction Animations

         // TODO ---- BELOW
        if (reduction.collapsingTiles) {
            this.setTiles(reduction.tiles);
        } else {
            this.setState({
                processingInput: false
            });
        }
        // TODO ---- ABOVE
    };

    private setTiles = (tiles: Utilities.Tile.Container[], row: number = this.state.row, column: number = this.state.column) : void => {
        const reduction: Utilities.Grid.Reduction = Utilities.Grid.reduceTiles(tiles);

        this.setState({
            processingInput: true,
            row: row,
            column: column,
            tiles: tiles
        }, () => this.removeReducedTiles(reduction));
    };

    private rotateTiles(row: number, column: number) : void {
        const index: number = Utilities.Grid.getTileIndexFromCoordinates(row, column),
              rotatedTiles: Utilities.General.IDictionary<Utilities.Tile.Container> = Utilities.Grid.rotateTiles(this.state.tiles, this.state.tiles[index]);

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

    private readonly keyDownEventActionMap: Utilities.General.IDictionary<() => void> = {
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

    componentDidMount() : void {
        document.addEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);

        this.setState({
            processingInput: false
        });
    };

    componentWillUnmount() : void {
        document.removeEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    componentDidUpdate(previousProps: Utilities.Grid.IProps, previousState: Utilities.Grid.State) : void {
        if (!Utilities.Game.isInProgress(previousProps.mode) && Utilities.Game.isInProgress(this.props.mode)) {
            this.setTiles(Utilities.Tile.generateTileContainers(), Utilities.Grid.initialRow, Utilities.Grid.initialColumn);
        }
    };

    render() : JSX.Element {
        const tiles: JSX.Element[] = this.state.tiles.map(tile => <Tile key={tile.index}
                                                                        mode={this.props.mode}
                                                                        color={tile.color}
                                                                        detonationRange={tile.detonationRange}
                                                                        row={tile.row}
                                                                        column={tile.column}
                                                                        selectedRow={this.state.row}
                                                                        selectedColumn={this.state.column}
                                                                        link={tile.link}
                                                                        onUpdate={this.handleUpdates}/>);

        return <div className={'grid ' + (Utilities.Game.isInProgress(this.props.mode) ? '' : 'hide ') + Utilities.App.Theme[this.props.theme]}>
                    {tiles}
               </div>;
    };
};