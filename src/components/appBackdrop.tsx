import * as React from 'react';
import '../styles/appBackdrop.scss';
import { Utilities } from '../utilities/utilities';

interface Props {
    view: Utilities.App.View;
    numberOfLines: number;
};

export class AppBackdrop extends React.Component<Props, object> {
    constructor(props: Props) {
        super(props);
    };

    shouldComponentUpdate(nextProps: Props, nextState: object) : boolean {
        return nextProps.numberOfLines !== this.props.numberOfLines || nextProps.view !== this.props.view;
    };

    render() : JSX.Element {
        const lines: JSX.Element[] = [],
              binderHoldes: JSX.Element[] = [];

        for (let i = 0; i < this.props.numberOfLines; ++i) {
            lines.push(<div key={i}
                            className='app-backdrop-line'>
                       </div>);
        }

        for (let i = 0; i < Utilities.AppBackdrop.numberOfBinderHoles; ++i) {
            binderHoldes.push(<div key={i}
                                   className='app-backdrop-binder-hole'>
                              </div>);
        }

        return <div className={'app-backdrop ' + this.props.view}>
            <div className='app-backdrop-left-margin'>
                <div className='app-backdrop-binder-holes'>
                    {binderHoldes}
                </div>
            </div>
            <div className='app-backdrop-right-margin'>
            </div>
            <div className='app-backdrop-lines'>
                {lines}
            </div>
        </div>
    };
};