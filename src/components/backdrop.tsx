import * as React from 'react';
import { BackdropState } from '../classes/backdropState';
import { IBackdropProps } from '../interfaces/iBackdropProps';
import { Theme } from '../utilities/enum';
import * as Shared from '../utilities/shared';

import '../styles/backdrop.scss';

export class Backdrop extends React.PureComponent<IBackdropProps, BackdropState> {
    private static readonly binderHoles: JSX.Element[] = Shared.fillArray(BackdropState.numberOfBinderHoles, i => {
        return <div key={i}
            className='backdrop-binder-hole'>
        </div>;
    });

    public readonly state: BackdropState = new BackdropState();

    public componentDidUpdate(): void {
        this.setState(new BackdropState());
    }

    public render(): JSX.Element {
        const lines: JSX.Element[] = Shared.fillArray(this.state.numberOfLines, i => {
            return <div key={i}
                        className='backdrop-line'>
                   </div>;
        });

        return <div className={`backdrop ${Theme[this.props.theme]}`}>
            <div className='backdrop-left-margin'>
                <div className='backdrop-binder-holes'>
                    {Backdrop.binderHoles}
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