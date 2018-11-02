import * as React from 'react';
import '../styles/topBar.scss';
import { Combo } from './combo';
import { Grade } from './grade';

interface Props {
    mode: Utilities.Game.Mode;
    view: Utilities.App.View;
    gradeIndex: Utilities.Game.GradeIndex;
    difficulty: Utilities.Game.Difficulty;
    combo: number;
    score: number;
    stage: number;
    playerName: string;
    readonly onUpdate: (updates: Utilities.Game.Updates) => void;
};

export class TopBar extends React.PureComponent<Props, object> {
    constructor(props: Props) {
        super(props);
    };

    render() : JSX.Element {
        return <div className={'top-bar ' + this.props.view + (!Utilities.Game.isInProgress(this.props.mode) ? ' hide': '')}>
            <div className='top-bar-left-hud'>
                <Combo combo={this.props.combo}
                       stage={this.props.stage}
                       difficulty={this.props.difficulty}
                       onUpdate={this.props.onUpdate}
                       gradeIndex={this.props.gradeIndex}
                       mode={this.props.mode}>
                </Combo>
                <div className='top-bar-name'>
                    {this.props.playerName}
                </div>
            </div>
            <div className='top-bar-middle-hud'>
                <Grade gradeIndex={this.props.gradeIndex}
                       difficulty={this.props.difficulty}
                       stage={this.props.stage}
                       mode={this.props.mode}
                       onUpdate={this.props.onUpdate}>
                </Grade>
            </div>
            <div className='top-bar-right-hud'>
                <div className='top-bar-score'>
                    Score: {this.props.score}
                </div>
                <div className='top-bar-stage'>
                    Stage: {this.props.stage}
                </div>
            </div>
        </div>;
    };
};