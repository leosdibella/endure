import * as React from 'react';
import '../../components/grid/grid.scss';
import { ViewModes } from '../../utilities/viewModes';
import { Tile, TileProps, TileStyle } from '../../components/tile/tile.component';
import { Utilities } from '../../utilities/utilities';
import { Colors } from '../../utilities/colors';
import { GameUpdates } from '../../components/game/game.component';
import { DirectedAcyclicGraph, ConnectedGraph } from '../../utilities/directedAcyclicGraph';

class Space {
    readonly id: string;
    readonly columnIndex: number;
    readonly rowIndex: number;

    constructor(row: number, column: number) {
        this.id = `(${row}, ${column})`;
        this.columnIndex = column;
        this.rowIndex = row;
    };
};

interface TileReductionDepenencies {
    totalWeight: number;
    tileIndicesToReduce: number[];
};

class State {
    static readonly numberOfSpacesHigh: number = 20;
    static readonly numberOfSpacesWide: number = 10;
    static readonly spacePixelDimensions: number = 25;
    static readonly totalHeight: number =  (State.spacePixelDimensions * State.numberOfSpacesHigh) + (State.numberOfSpacesHigh - 1);
    static readonly totalWidth: number = State.spacePixelDimensions * State.numberOfSpacesWide + (State.numberOfSpacesWide - 1);

    readonly spaces: Space[] = [];
    readonly tiles: TileProps[] = [];
    
    currentLeftMostColumn: number = 4;

    private generateConnectedSubGraphFromTilesWithColor(color: Colors.Color) : ConnectedGraph {
        const tilesMatchingColor = this.tiles.filter(tile => tile.colors.indexOf(color) > -1, [])
                                             .sort((a, b) => a.row - b.row || a.column - b.column),
              directedAcyclicGraph = new DirectedAcyclicGraph(this.tiles);

        let wieght,
            tileA,
            tileB;

        for (let i = 0; i < tilesMatchingColor.length; ++i) {
            for (let j = i + 1; j < tilesMatchingColor.length; ++j) {
                tileA = tilesMatchingColor[i];
                tileB = tilesMatchingColor[j];

                if ((tileA.column === tileB.column && tileA.row + 1 === tileB.row) || (tileA.row === tileB.row && tileA.column + 1 === tileB.column)) {
                    wieght = Colors.howManyColorsDoPairOfColorPairsShare(tileA.colors, tileB.colors, true);
                    directedAcyclicGraph.addEdge(State.getTileIndex(tileA.row, tileA.column), State.getTileIndex(tileB.row, tileB.column), wieght);
                }
            }
        }

        return directedAcyclicGraph.generateLargestConnectedSubgraph();
    };

    private static getTileIndex(row: number, column: number) : number {
        return row * State.numberOfSpacesHigh + column;
    };

    private getTileReductionDependencies() : TileReductionDepenencies {
        const coloredSubgraphs = Colors.VALUES.map(color => this.generateConnectedSubGraphFromTilesWithColor(color))
                                              .filter(subgraph=> subgraph.vertexIndices.length > 4, []);

        let tileIndicesToReduce: number[] = [],
            distinctUnionOfNonDisjointTileIndices: number[],
            totalWeight: number = 0;

        for (let i = 0; i < coloredSubgraphs.length; ++i) {
            for (let j = i + 1; j < coloredSubgraphs.length; ++j) {
                distinctUnionOfNonDisjointTileIndices = Utilities.conditionallyDistinctUnionNumericalArrays(coloredSubgraphs[i].vertexIndices, coloredSubgraphs[j].vertexIndices, false);
                
                if (Utilities.isWellDefinedValue(distinctUnionOfNonDisjointTileIndices)) {
                    tileIndicesToReduce = Utilities.conditionallyDistinctUnionNumericalArrays(tileIndicesToReduce, distinctUnionOfNonDisjointTileIndices);
                    totalWeight += coloredSubgraphs[i].weight + coloredSubgraphs[j].weight;
                }
            }
        }

        return {
            tileIndicesToReduce: tileIndicesToReduce,
            totalWeight: totalWeight
        };
    };

    reduceTiles() : TileReductionDepenencies {
        const tileReductionDepenencies: TileReductionDepenencies = this.getTileReductionDependencies();

        for (let i = 0; i < tileReductionDepenencies.tileIndicesToReduce.length; ++i) {
            this.tiles[tileReductionDepenencies.tileIndicesToReduce[i]] = null;
        }

        return tileReductionDepenencies;
    };

    updateTile(row: number, column: number, colors: Colors.Color[], height: number = State.spacePixelDimensions, width: number = State.spacePixelDimensions) : void {
        const top: number = (row * State.spacePixelDimensions) + (row + 1),
              left: number = (column * State.spacePixelDimensions) + column;

        this.tiles[State.getTileIndex(row, column)] = new TileProps(`${row}-${column}`, colors, new TileStyle(top, left, height, width), row, column);
    }

    constructor() {
        for (let i = 0; i < State.numberOfSpacesHigh; ++i) {
            for (let j = 0; j < State.numberOfSpacesWide; ++j) {
                this.spaces.push(new Space(i, j));
                this.tiles.push(null);
            }
        }

        this.updateTile(0, 0, [Colors.Color.Blue, Colors.Color.Green]);
        this.updateTile(1, 0, [Colors.Color.Green, Colors.Color.Orange]);
        this.updateTile(3, 0, [Colors.Color.Violet, Colors.Color.Green]);
        this.updateTile(3, 1, [Colors.Color.Red, Colors.Color.Blue]);
        this.updateTile(3, 2, [Colors.Color.Yellow, Colors.Color.Blue]);
        this.updateTile(3, 3, [Colors.Color.Yellow, Colors.Color.Green]);
        this.updateTile(4, 0, [Colors.Color.Orange, Colors.Color.Violet]);
        this.updateTile(4, 3, [Colors.Color.Yellow, Colors.Color.Violet]);
    }
};

const initialState = new State();

export class GridProps {
    viewMode: ViewModes.Mode;
    allowInteraction: boolean;
    readonly onChanges: (gameUpdates: GameUpdates) => void;

    constructor(viewMode: ViewModes.Mode, allowInteraction: boolean, onChanges: (gameUpdates: GameUpdates) => void) {
        this.viewMode = viewMode;
        this.allowInteraction = allowInteraction;
        this.onChanges = onChanges;
    };
};

export class Grid extends React.Component<GridProps, State> {
    readonly state: State = initialState;

    constructor(props: GridProps) {
        super(props);
    };

    private readonly onKeyPress = (keyboardEvent: KeyboardEvent) : void => {
        switch (keyboardEvent.key.toUpperCase()) {
            case 'A': {
                if (this.state.currentLeftMostColumn > 0) {
                    this.setState({
                        currentLeftMostColumn: this.state.currentLeftMostColumn - 1
                    });
                }

                break;
            }
            case 'D': {
                if (this.state.currentLeftMostColumn < State.numberOfSpacesWide - 2) {
                    this.setState({
                        currentLeftMostColumn: this.state.currentLeftMostColumn + 1
                    });
                }

                break;
            }
            default: break;
        }
    };

    private getSpaceClassName(columnIndex: number, accentClass: string) : string {
        return 'space' + (this.props.allowInteraction && (columnIndex === this.state.currentLeftMostColumn || columnIndex === this.state.currentLeftMostColumn + 1) ? ' ' + accentClass : '');
    };

    componentDidMount() {
        document.addEventListener('keypress', this.onKeyPress);
    };

    componentWillUnmount() {
        document.removeEventListener('keypress', this.onKeyPress);
    };

    render() {
        const spaces: JSX.Element[] = this.state.spaces.map(space =>
            <div key={space.id} className={this.getSpaceClassName(space.columnIndex, this.props.viewMode.accentClass)}>
                {space.id}
            </div>);
        
        const tiles: JSX.Element[] = this.state.tiles.filter(tile => Utilities.isWellDefinedValue(tile))
                                                     .map(tile => <Tile key={tile.id} tileStyle={tile.tileStyle} id={tile.id} colors={tile.colors} row={tile.row} column={tile.column}/>);

        return <div className={'grid ' + this.props.viewMode.baseClass}>
            {tiles}
            {spaces}
        </div>;
    };
};