import * as React from 'react';
import '../styles/backdrop.scss';
import { Utilities } from '../utilities/utilities';

export interface BackdropProps {
    viewMode: Utilities.ViewMode;
    numberOfLines: number;
};

export class Backdrop extends React.Component<BackdropProps, object> {
    constructor(props: BackdropProps) {
        super(props);
    };

    shouldComponentUpdate(nextProps: BackdropProps, nextState: object) : boolean {
        return nextProps.numberOfLines !== this.props.numberOfLines || nextProps.viewMode !== this.props.viewMode;
    };

    render() {
        const backdropLines: JSX.Element[] = [];

        for (let i = 0; i < this.props.numberOfLines; ++i) {
            backdropLines.push(<div key={i}
                                    className='backdrop-line'>
                                </div>);
        }

        return <div className={'backdrop ' + this.props.viewMode}>
            <div className='backdrop-left-margin'>
            </div>
            <div className='backdrop-right-margin'>
            </div>
            <div className='backdrop-lines'>
                {backdropLines}
            </div>
        </div>
    };
};