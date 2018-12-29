import * as React from 'react';
import { IHeaderProps } from '../interfaces/iHeaderProps';
import { Theme } from '../utilities/enum';
import { Combo } from './combo';
import { Grade } from './grade';

import '../styles/header.scss';

export class Header extends React.PureComponent<IHeaderProps, object> {
    public render(): JSX.Element {
        return <div className={`header ${Theme[this.props.theme]}`}>
            <div className='header-left-hud'>
                <Combo combo={this.props.combo}
                       stage={this.props.stage}
                       theme={this.props.theme}
                       difficulty={this.props.difficulty}
                       onUpdate={this.props.onUpdate}
                       letterGrade={this.props.letterGrade}
                       gameMode={this.props.gameMode}>
                </Combo>
                <div className='header-name'>
                    {this.props.playerName}
                </div>
            </div>
            <Grade theme={this.props.theme}
                   letterGrade={this.props.letterGrade}
                   difficulty={this.props.difficulty}
                   stage={this.props.stage}
                   gameMode={this.props.gameMode}
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