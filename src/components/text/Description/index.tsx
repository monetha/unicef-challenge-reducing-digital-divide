import React from 'react';
import classnames from 'classnames';
import './style.scss';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps extends React.HTMLProps<HTMLDivElement> {
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export class Description extends React.PureComponent<IProps> {
  public render() {
    const { children, className, ...rest } = this.props;

    return (
      <div
        {...rest}
        className={classnames('mh-description', className)}
      >
        {children}
      </div>
    );
  }
}

// #endregion
