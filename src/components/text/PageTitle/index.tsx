import React from 'react';
import classnames from 'classnames';
import './style.scss';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps extends React.HTMLProps<HTMLHeadingElement> {
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export class PageTitle extends React.PureComponent<IProps> {
  public render() {
    const { children, className, ...rest } = this.props;

    return (
      <h1
        {...rest}
        className={classnames('mh-page-title', className)}
      >
        {children}
      </h1>
    );
  }
}

// #endregion
