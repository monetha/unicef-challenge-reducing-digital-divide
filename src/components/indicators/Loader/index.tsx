import React from 'react';
import './style.scss';
import classnames from 'classnames';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps {
  message?: React.ReactNode;
  fullscreen?: boolean;
  fullArea?: boolean;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export class Loader extends React.PureComponent<IProps> {

  public render() {
    const { message, fullscreen, fullArea } = this.props;

    return (
      <div
        className={classnames('mh-loader', {
          'mh-fullscreen': fullscreen,
          'mh-fullarea': fullArea,
        })}
      >
        <div className='mh-spinner' />

        {message && (
          <div className='mh-message'>
            {message}
          </div>
        )}
      </div>
    );
  }
}

// #endregion
