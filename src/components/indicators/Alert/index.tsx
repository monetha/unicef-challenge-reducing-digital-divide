import React from 'react';
import classnames from 'classnames';
import './style.scss';

// #region -------------- Interfaces --------------------------------------------------------------

export enum AlertType {
  Info = 1,
  Warning,
  Error,
  Success,
}

export interface IProps {
  type: AlertType;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export class Alert extends React.PureComponent<IProps> {

  public render() {
    const { children, type } = this.props;

    const resultType: AlertType = type || AlertType.Info;

    return (
      <div
        className={classnames('mh-alert', {
          'mh-info': resultType === AlertType.Info,
          'mh-warning': resultType === AlertType.Warning,
          'mh-error': resultType === AlertType.Error,
          'mh-success': resultType === AlertType.Success,
        })}
      >
        {children}
      </div>
    );
  }
}

// #endregion
