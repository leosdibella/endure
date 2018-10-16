import * as React from 'react';
import '../../components/grid/grid.scss';
import { ViewModes } from '../../utilities/viewModes';
import { Tile, TileProps, TileStyle } from '../../components/tile/tile.component';
import { Utilities } from '../../utilities/utilities';
import { Colors } from '../../utilities/colors';

class Space {
    readonly id: string;
    readonly columnIndex: number;
    readonly rowIndex: number;

    constructor(row: number, column: number) {
        this.id = `(${row}, ${column})`;
        this.columnIndex = column;
        this.rowIndex = row;
    };
}

class State {
    static readonly numberOfSpacesHigh: number = 36;
    static readonly numberOfSpacesWide: number = 18;
    static readonly spacePixelDimensions: number = 25;
    static readonly totalHeight: number =  (State.spacePixelDimensions * State.numberOfSpacesHigh) + (State.numberOfSpacesHigh - 1);
    static readonly totalWidth: number = State.spacePixelDimensions * State.numberOfSpacesWide + (State.numberOfSpacesWide - 1);

    readonly spaces: Space[] = [];
    readonly tiles: TileProps[][] = [];
    
    currentLeftMostColumn: number = 8;

    getSpaceClassName(allowInteraction: boolean, columnIndex: number, accentClass: string) : string {
        return 'space' + (allowInteraction && (columnIndex === this.currentLeftMostColumn || columnIndex === this.currentLeftMostColumn + 1) ? ' ' + accentClass : '');
    };

    constructor() {
        for (let i = 0; i < State.numberOfSpacesHigh; ++i) {
            this.tiles.push([]);

            for (let j = 0; j < State.numberOfSpacesWide; ++j) {
                this.spaces.push(new Space(i, j));
            }
        }

        this.tiles[0].push(new TileProps(`0-0`, [Colors.BLUE, Colors.GREEN], new TileStyle(1, 0, 25, 25)));
        this.tiles[1].push(new TileProps(`1-0`, [Colors.GREEN, Colors.ORANGE], new TileStyle(27, 0, 25, 25)));
        this.tiles[3].push(new TileProps(`3-0`, [Colors.VIOLET], new TileStyle(79, 0, 25, 25)));
        this.tiles[3].push(new TileProps(`3-1`, [Colors.RED, Colors.BLUE], new TileStyle(79, 26, 25, 25)));
        this.tiles[3].push(new TileProps(`3-2`, [Colors.YELLOW], new TileStyle(79, 78, 25, 26)));
        this.tiles[3].push(new TileProps(`3-3`, [Colors.YELLOW], new TileStyle(79, 104, 26, 25)));
        this.tiles[4].push(new TileProps(`4-0`, [Colors.ORANGE], new TileStyle(105, 0, 25, 25)));
        this.tiles[4].push(null);
        this.tiles[4].push(null);
        this.tiles[4].push(new TileProps(`4-3`, [Colors.YELLOW], new TileStyle(105, 104, 25, 25)));
    }
};

const initialState = new State();

export class GridProps {
    viewMode: ViewModes.Mode;
    allowInteraction: boolean;

    constructor(viewMode: ViewModes.Mode, allowInteraction: boolean) {
        this.viewMode = viewMode;
        this.allowInteraction = allowInteraction;
    };
};

export class Grid extends React.Component<GridProps, State> {
    readonly state: State = initialState;

    constructor(props: GridProps) {
        super(props);
    };

    render() {
        const spaces: JSX.Element[] = this.state.spaces.map(space =>
            <div key={space.id} className={this.state.getSpaceClassName(this.props.allowInteraction, space.columnIndex, this.props.viewMode.accentClass)}>
                {space.id}
            </div>);
        
        const tiles: JSX.Element[] = this.state.tiles.reduce((previous, current) => previous.concat(current))
                                                     .filter(tile => Utilities.isWellDefinedValue(tile))
                                                     .map(tile => <Tile key={tile.id} tileStyle={tile.tileStyle} id={tile.id} colors={tile.colors}/>);

        return <div className={'grid ' + this.props.viewMode.baseClass}>
            {tiles}
            {spaces}
        </div>;
    };
};