import * as React from 'react';
import '../../components/grid/grid.scss';
import { ViewModes } from '../../utilities/viewModes';
import { Tile, TileProps } from '../../components/tile/tile.component';

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
            for (let j = 0; j < State.numberOfSpacesWide; ++j) {
                this.spaces.push(new Space(i, j));
            }
        } 
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
        const spaces: JSX.Element[] = this.state.spaces.map(space => <div key={space.id} className={this.state.getSpaceClassName(this.props.allowInteraction, space.columnIndex, this.props.viewMode.accentClass)}>{space.id}</div>);
        
        //this.state.tiles.map(row => row.map(tile => <Tile row={tile.row} column={tile.column}/>));

        return <div className={'grid ' + this.props.viewMode.baseClass}>
            {spaces}
        </div>;
    };
};