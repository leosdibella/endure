import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/grid.scss';

import { Tile } from './tile';

export class Grid extends React.PureComponent<Utilities.Grid.IProps, Utilities.Grid.State> {
    private readonly onKeyDown: (keyboardEvent: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onUpdate: (row: number, column: number) => void = this.handleUpdate.bind(this);

    private readonly keyDownEventActionMap: Utilities.General.IDictionary<() => void> = {
        ' ': this.rotateTile.bind(this),
        'a': this.moveLeft.bind(this),
        'arrowdown': this.moveDown.bind(this),
        'arrowleft': this.moveLeft.bind(this),
        'arrowright': this.moveRight.bind(this),
        'arrowup': this.moveUp.bind(this),
        'd': this.moveRight.bind(this),
        's': this.moveDown.bind(this),
        'w': this.moveUp.bind(this)
    };

    private removeReducedTiles(reduction: Utilities.Grid.IReduction): void {
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
    }

    private setTiles = (tiles: Utilities.Tile.Container[], row: number = this.state.row, column: number = this.state.column): void => {
        const reduction: Utilities.Grid.IReduction = Utilities.Grid.reduceTiles(this.state);

        this.setState({
            column,
            processingInput: true,
            row,
            tiles
        }, () => this.removeReducedTiles(reduction));
    }

    private rotateTiles(): void {
        const rotatedTiles: Utilities.General.IDictionary<Utilities.Tile.Container> = Utilities.Grid.rotateTiles(this.props, this.state);

        // TODO: Add Rotation Animations
        this.setTiles(this.state.tiles.map(t => new Utilities.Maybe(rotatedTiles[t.index]).getOrDefault(t)));
    }

    private detonateTile(): void {
        const  todo: number = 0;
    }

    private handleUpdate(row: number, column: number): void {
        if (!this.state.processingInput) {
            const tile: Utilities.Tile.Container = this.state.tiles[Utilities.Grid.getTileIndexFromCoordinates(Utilities.Grid.getGridDimension(this.props), row, column)];

            this.setState({
                column,
                processingInput: true,
                row
            }, () => tile.detonationRange === Utilities.Tile.DetonationRange.none ? this.rotateTiles() : this.detonateTile());
        }
    }

    private moveRight(): void {
        this.setState({
            column: Utilities.Grid.movementFunctions[Utilities.Tile.Link.right](this.props, this.state)
        });
    }

    private moveLeft(): void {
        this.setState({
            column: Utilities.Grid.movementFunctions[Utilities.Tile.Link.left](this.props, this.state)
        });
    }

    private moveUp(): void {
        this.setState({
            row: Utilities.Grid.movementFunctions[Utilities.Tile.Link.top](this.props, this.state)
        });
    }

    private moveDown(): void {
        this.setState({
            row: Utilities.Grid.movementFunctions[Utilities.Tile.Link.bottom](this.props, this.state)
        });
    }

    private rotateTile(): void {
        this.handleUpdate(this.state.row, this.state.column);
    }

    private handleKeyDown(keyboardEvent: KeyboardEvent): void {
        if (this.props.mode === Utilities.Game.Mode.inGame) {
           new Utilities.Maybe(this.keyDownEventActionMap[keyboardEvent.key.toLocaleLowerCase()]).justDo(kdh => kdh.call(this));
        }
    }

    readonly state: Utilities.Grid.State = new Utilities.Grid.State(this.props);

    componentDidMount(): void {
        document.addEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);

        this.setState({
            processingInput: false
        });
    }

    componentWillUnmount(): void {
        document.removeEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    }

    componentDidUpdate(previousProps: Utilities.Grid.IProps, previousState: Utilities.Grid.State): void {
        if (!Utilities.Game.isInProgress(previousProps.mode) && Utilities.Game.isInProgress(this.props.mode)) {
            const dimension: Utilities.Grid.IGridDimension = Utilities.Grid.getGridDimension(this.props);

            this.setTiles(Utilities.Grid.generateTiles(dimension), dimension.initialRow, dimension.initialColumn);
        }
    }

    render(): JSX.Element {
        const tiles: JSX.Element[] = this.state.tiles.map(tile => <Tile key={tile.index}
                                                                        mode={this.props.mode}
                                                                        color={tile.color}
                                                                        detonationRange={tile.detonationRange}
                                                                        row={tile.row}
                                                                        column={tile.column}
                                                                        selectedRow={this.state.row}
                                                                        selectedColumn={this.state.column}
                                                                        link={tile.link}
                                                                        onUpdate={this.onUpdate}/>);

        return <div className={'grid ' + (Utilities.Game.isInProgress(this.props.mode) ? '' : 'hide ') + Utilities.App.Theme[this.props.theme]}>
                    {tiles}
               </div>;
    }
}