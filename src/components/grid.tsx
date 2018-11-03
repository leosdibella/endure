import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/grid.scss';

import { Tile } from './tile';

interface State {
    tiles: Utilities.Grid.Tile[];
    column: number;
    row: number;
    processingInput: boolean;
};

interface Props {
    view: Utilities.App.View;
    mode: Utilities.Game.Mode;
    readonly onUpdate: (updates: Utilities.Game.Updates) => void;
};

export class Grid extends React.PureComponent<Props, State> {
    readonly state: State;

    private static generateTile(row: number, column: number, colorIndex: number) : Utilities.Grid.Tile {
        return {
            index: Utilities.Grid.getTileIndexFromCoordinates(row, column),
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

    private readonly rotateTiles = (row: number, column: number) : void => {
        const index: number = Utilities.Grid.getTileIndexFromCoordinates(row, column),
              transformedTiles: Utilities.Grid.Tile[] = Utilities.Grid.rotateTiles(this.state.tiles, this.state.tiles[index]);
        
        // TODO, add animations via GridOverlay, reduce tiles etc
        this.setState({
            tiles: transformedTiles,
            processingInput: false
        });
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

    private readonly keyDownEventActionMap: { [key: string]: () => void } = {
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
            row: 8,
            column: 5,
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
            this.setState({
                tiles: Grid.generateInitialTiles()
            });
        }
    };

    render() : JSX.Element {
        const tiles: JSX.Element[] = this.state.tiles.map(tile => <Tile key={tile.index}
                                                                        mode={this.props.mode}
                                                                        index={tile.index}
                                                                        colorIndex={tile.colorIndex}
                                                                        row={tile.row}
                                                                        column={tile.column}
                                                                        isSelected={this.state.row === tile.row && this.state.column === tile.column}
                                                                        onUpdate={this.handleUpdates}/>);

        return <div className={'grid' + (Utilities.Game.isInProgress(this.props.mode) ? ' ' : ' hide ') + this.props.view}>
                    {tiles}
               </div>;
    };
};