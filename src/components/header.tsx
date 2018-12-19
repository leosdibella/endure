import * as React from 'react';

import * as AppUtilities from '../utilities/app';
import * as GameUtilities from '../utilities/game';
import * as HeaderUtilities from '../utilities/header';

import '../styles/header.scss';

import { Combo } from './combo';
import { Grade } from './grade';

class Header extends React.PureComponent<HeaderUtilities.IProps, object> {
    public render(): JSX.Element {
        return <div className={`header ${AppUtilities.Theme[this.props.theme]} ${!GameUtilities.State.isInProgress(this.props.mode) ? ' hide' : ''}`}>
            <div className='header-left-hud'>
                <Combo combo={this.props.combo}
                       stage={this.props.stage}
                       theme={this.props.theme}
                       difficulty={this.props.difficulty}
                       onUpdate={this.props.onUpdate}
                       letterGrade={this.props.letterGrade}
                       mode={this.props.mode}>
                </Combo>
                <div className='header-name'>
                    {this.props.playerName}
                </div>
            </div>
            <Grade theme={this.props.theme}
                   letterGrade={this.props.letterGrade}
                   difficulty={this.props.difficulty}
                   stage={this.props.stage}
                   mode={this.props.mode}
                   onUpdate={this.props.onUpdate}>
            </Grade>
            <div className='header-right-hud'>
                <div className='header-score'>
                    Score: {this.props.score}
                </div>
                <div className='header-stage'>
                    Stage: {this.props.stage}
                </div>
            </div>
        </div>;
    }
}

export {
    Header
};