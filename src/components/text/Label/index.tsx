import React from 'react';
import classnames from 'classnames';
import './style.scss';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps extends React.HTMLProps<HTMLLabelElement> {
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export class Label extends React.PureComponent<IProps> {
  public render() {
    const { children, className, ...rest } = this.props;

    return (
      <label
        {...rest}
        className={classnames('mh-label', className)}
      >
        {children}
      </label>
    );
  }
}

// #endregion
