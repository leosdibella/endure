import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/topBar.scss';

import { Combo } from './combo';
import { Grade } from './grade';

export class TopBar extends React.PureComponent<Utilities.TopBar.IProps, object> {
    render(): JSX.Element {
        return <div className={'top-bar ' + Utilities.App.Theme[this.props.theme] + (!Utilities.Game.isInProgress(this.props.mode) ? ' hide' : '')}>
            <div className='top-bar-left-hud'>
                <Combo combo={this.props.combo}
                       stage={this.props.stage}
                       theme={this.props.theme}
                       difficulty={this.props.difficulty}
                       onUpdate={this.props.onUpdate}
                       letterGrade={this.props.letterGrade}
                       mode={this.props.mode}>
                </Combo>
                <div className='top-bar-name'>
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
            <div className='top-bar-right-hud'>
                <div className='top-bar-score'>
                    Score: {this.props.score}
                </div>
                <div className='top-bar-stage'>
                    Stage: {this.props.stage}
                </div>
            </div>
        </div>;
    }
}