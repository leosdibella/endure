import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/appBackdrop.scss';

export class AppBackdrop extends React.PureComponent<Utilities.AppBackdrop.IProps, Utilities.AppBackdrop.State> {
    readonly state: Utilities.AppBackdrop.State = new Utilities.AppBackdrop.State();

    private setNumberOfLines() {
        this.setState(new Utilities.AppBackdrop.State());
    };

    componentDidUpdate(previousProps: Utilities.AppBackdrop.IProps, previousState: Utilities.AppBackdrop.State) : void {
        if (previousProps.orientation !== this.props.orientation) {
            this.setNumberOfLines();
        }
    };

    render() : JSX.Element {
        const lines: JSX.Element[] = [],
              binderHoldes: JSX.Element[] = [];

        for (let i = 0; i < this.state.numberOfLines; ++i) {
            lines.push(<div key={i}
                            className='app-backdrop-line'>
                       </div>);
        }

        for (let i = 0; i < Utilities.AppBackdrop.numberOfBinderHoles; ++i) {
            binderHoldes.push(<div key={i}
                                   className='app-backdrop-binder-hole'>
                              </div>);
        }

        return <div className={'app-backdrop ' + Utilities.App.Theme[this.props.theme]}>
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