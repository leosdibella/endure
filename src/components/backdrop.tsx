import * as React from 'react';
import '../styles/backdrop.scss';
import { Utilities } from '../utilities/utilities';

export interface BackdropProps {
    view: Utilities.App.View;
    numberOfLines: number;
};

export class Backdrop extends React.Component<BackdropProps, object> {
    constructor(props: BackdropProps) {
        super(props);
    };

    shouldComponentUpdate(nextProps: BackdropProps, nextState: object) : boolean {
        return nextProps.numberOfLines !== this.props.numberOfLines || nextProps.view !== this.props.view;
    };

    render() : JSX.Element {
        const backdropLines: JSX.Element[] = [],
              binderHoldes: JSX.Element[] = [];

        for (let i = 0; i < this.props.numberOfLines; ++i) {
            backdropLines.push(<div key={i}
                                    className='backdrop-line'>
                                </div>);
        }

        for (let i = 0; i < Utilities.Backdrop.numberOfBinderHoles; ++i) {
            binderHoldes.push(<div key={i}
                                   className='backdrop-binder-hole'>
                              </div>);
        }

        return <div className={'backdrop ' + this.props.view}>
            <div className='backdrop-left-margin'>
                <div className='backdrop-binder-holes'>
                    {binderHoldes}
                </div>
            </div>
            <div className='backdrop-right-margin'>
            </div>
            <div className='backdrop-lines'>
                {backdropLines}
            </div>
        </div>
    };
};