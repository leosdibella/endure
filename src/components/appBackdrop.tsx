import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/appBackdrop.scss';

const binderHoles: JSX.Element[] = Utilities.General.iterateIntoArray(Utilities.AppBackdrop.numberOfBinderHoles, i => {
    return <div key={i}
        className='app-backdrop-binder-hole'>
    </div>;
});

export class AppBackdrop extends React.PureComponent<Utilities.AppBackdrop.IProps, Utilities.AppBackdrop.State> {
    readonly state: Utilities.AppBackdrop.State = new Utilities.AppBackdrop.State();

    componentDidUpdate(previousProps: Utilities.AppBackdrop.IProps, previousState: Utilities.AppBackdrop.State) : void {
        this.setState(new Utilities.AppBackdrop.State());
    };

    render() : JSX.Element {
        const lines: JSX.Element[] = Utilities.General.iterateIntoArray(this.state.numberOfLines, i => {
            return <div key={i}
                        className='app-backdrop-line'>
                   </div>;
        });

        return <div className={'app-backdrop ' + Utilities.App.Theme[this.props.theme]}>
            <div className='app-backdrop-left-margin'>
                <div className='app-backdrop-binder-holes'>
                    {binderHoles}
                </div>
            </div>
            <div className='app-backdrop-right-margin'>
            </div>
            <div className='app-backdrop-lines'>
                {lines}
            </div>
        </div>;
    };
};