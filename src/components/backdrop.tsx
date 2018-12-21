import * as React from 'react';

import * as BackdropUtilities from '../utilities/backdrop';
import * as Shared from '../utilities/shared';

import '../styles/backdrop.scss';

const binderHoles: JSX.Element[] = Shared.fillArray(BackdropUtilities.State.numberOfBinderHoles, i => {
    return <div key={i}
        className='backdrop-binder-hole'>
    </div>;
});

class Backdrop extends React.PureComponent<BackdropUtilities.IProps, BackdropUtilities.State> {
    public readonly state: BackdropUtilities.State = new BackdropUtilities.State();

    public componentDidUpdate(): void {
        this.setState(new BackdropUtilities.State());
    }

    public render(): JSX.Element {
        const lines: JSX.Element[] = Shared.fillArray(this.state.numberOfLines, i => {
            return <div key={i}
                        className='backdrop-line'>
                   </div>;
        });

        return <div className={`backdrop ${Shared.Theme[this.props.theme]}`}>
            <div className='backdrop-left-margin'>
                <div className='backdrop-binder-holes'>
                    {binderHoles}
                </div>
            </div>
            <div className='backdrop-right-margin'>
            </div>
            <div className='backdrop-lines'>
                {lines}
            </div>
        </div>;
    }
}

export {
    Backdrop
};