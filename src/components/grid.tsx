import * as React from 'react';

import * as AppUtilities from '../utilities/app';
import * as GameUtilities from '../utilities/game';
import * as GeneralUtilities from '../utilities/general';
import * as GridUtilities from '../utilities/grid';
import { Maybe } from '../utilities/maybe';
import * as TileUtilities from '../utilities/tile';

import '../styles/grid.scss';

import { Tile } from './tile';

export class Grid extends React.PureComponent<GridUtilities.IProps, GridUtilities.State> {
    private readonly onKeyDown: (keyboardEvent: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onUpdate: (row: number, column: number) => void = this.handleUpdate.bind(this);
    private readonly onMoveLeft: () => void = this.moveLeft.bind(this);
    private readonly onMoveRight: () => void = this.moveRight.bind(this);
    private readonly onMoveUp: () => void = this.moveUp.bind(this);
    private readonly onMoveDown: () => void = this.moveDown.bind(this);

    private readonly keyDownEventActionMap: GeneralUtilities.IDictionary<() => void> = {
        ' ': this.rotateTile.bind(this),
        'a': this.onMoveLeft,
        'arrowdown': this.onMoveDown,
        'arrowleft': this.onMoveLeft,
        'arrowright': this.onMoveRight,
        'arrowup': this.onMoveUp,
        'd': this.onMoveRight,
        's': this.onMoveDown,
        'w': this.onMoveUp
    };

    private removeReducedTiles(reduction: GridUtilities.IReduction): void {
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

    private setTiles = (tiles: TileUtilities.Container[], row: number = this.state.row, column: number = this.state.column): void => {
        const reduction: GridUtilities.IReduction = GridUtilities.reduceTiles(this.state);

        this.setState({
            column,
            processingInput: true,
            row,
            tiles
        }, () => this.removeReducedTiles(reduction));
    }

    private rotateTiles(): void {
        const rotatedTiles: GeneralUtilities.IDictionary<TileUtilities.Container> = GridUtilities.rotateTiles(this.props, this.state);

        // TODO: Add Rotation Animations
        this.setTiles(this.state.tiles.map(t => new Maybe(rotatedTiles[t.index]).getOrDefault(t)));
    }

    private detonateTile(): void {
        const  todo: number = 0;
    }

    private handleUpdate(row: number, column: number): void {
        if (!this.state.processingInput) {
            const tile: TileUtilities.Container = this.state.tiles[GridUtilities.getTileIndexFromCoordinates(GridUtilities.getGridDimension(this.props), row, column)];

            this.setState({
                column,
                processingInput: true,
                row
            }, () => tile.detonationRange === TileUtilities.DetonationRange.none ? this.rotateTiles() : this.detonateTile());
        }
    }

    private moveRight(): void {
        this.setState({
            column: GridUtilities.movementFunctions[TileUtilities.Link.right](this.props, this.state)
        });
    }

    private moveLeft(): void {
        this.setState({
            column: GridUtilities.movementFunctions[TileUtilities.Link.left](this.props, this.state)
        });
    }

    private moveUp(): void {
        this.setState({
            row: GridUtilities.movementFunctions[TileUtilities.Link.top](this.props, this.state)
        });
    }

    private moveDown(): void {
        this.setState({
            row: GridUtilities.movementFunctions[TileUtilities.Link.bottom](this.props, this.state)
        });
    }

    private rotateTile(): void {
        this.handleUpdate(this.state.row, this.state.column);
    }

    private handleKeyDown(keyboardEvent: KeyboardEvent): void {
        if (this.props.mode === GameUtilities.Mode.inGame) {
           new Maybe(this.keyDownEventActionMap[keyboardEvent.key.toLocaleLowerCase()]).justDo(kdh => kdh.call(this));
        }
    }

    public readonly state: GridUtilities.State = new GridUtilities.State(this.props);

    public componentDidMount(): void {
        document.addEventListener(GeneralUtilities.DomEvent.keyDown, this.onKeyDown);

        this.setState({
            processingInput: false
        });
    }

    public componentWillUnmount(): void {
        document.removeEventListener(GeneralUtilities.DomEvent.keyDown, this.onKeyDown);
    }

    public componentDidUpdate(previousProps: GridUtilities.IProps): void {
        if (!GameUtilities.isInProgress(previousProps.mode) && GameUtilities.isInProgress(this.props.mode)) {
            const dimension: GridUtilities.IGridDimension = GridUtilities.getGridDimension(this.props);

            this.setTiles(GridUtilities.generateTiles(dimension), dimension.initialRow, dimension.initialColumn);
        }
    }

    public render(): JSX.Element {
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

        return <div className={'grid ' + (GameUtilities.isInProgress(this.props.mode) ? '' : 'hide ') + AppUtilities.Theme[this.props.theme]}>
                    {tiles}
               </div>;
    }
}