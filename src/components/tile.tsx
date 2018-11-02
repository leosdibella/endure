import * as React from 'react';
import '../styles/tile.scss';

interface Props {
    colorIndex: number;
    index: number;
    row: number;
    column: number;
    onUpdate: (index: number) => void;
};

export class Tile extends React.Component<Props, object> {
    constructor(props: Props) {
        super(props);
    };

    private getClassName() : string {
        if (Utilities.General.isWellDefinedValue(this.props.colorIndex)) {
            return 'tile-' + Utilities.Grid.colors[this.props.colorIndex];
        }

        return 'tile-annihilated';
    };

    private getStyle() : Utilities.General.CssStyle {
        return {
            top: (this.props.row * 59) + 1 + 'px',
            left: (this.props.column * 59) + 1 + 'px'
        };
    };

    private readonly onClick = (event: React.MouseEvent<HTMLDivElement>) : void => {
        this.props.onUpdate(this.props.index);
    };

    shouldComponentUpdate(nextProps: Props, nextState: object) : boolean {
        return this.props.colorIndex !== nextProps.colorIndex
            || this.props.index !== nextProps.index
            || this.props.row !== nextProps.row
            || this.props.column !== nextProps.column;
    };

    render() : JSX.Element {
        return <div className={this.getClassName()}
                    style={this.getStyle()}
                    onClick={this.onClick}>
               </div>;
    };
};