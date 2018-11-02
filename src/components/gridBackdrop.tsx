import * as React from 'react';
import '../styles/gridBackdrop.scss';

export class GridBackdrop extends React.PureComponent<object, object> {
    render() : JSX.Element {
        const spaces: JSX.Element[] = [];

        for (let i = 0; i < Utilities.Grid.numberOfTilesHigh; ++i) {
            let row: JSX.Element[] = [];

            for (let j = 0; j < Utilities.Grid.numberOfTilesWide; ++j) {
                row.push(<div key={i + '_' + j}
                              className='grid-backdrop-space'>
                         </div>);
            }

            spaces.push(<div key={i}
                             className='grid-backdrop-row'>
                             {row}
                        </div>);
        }

        return <div className={'grid-backdrop'}>
                   {spaces}
               </div>;
    };
};