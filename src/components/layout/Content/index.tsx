import React from 'react';
import classnames from 'classnames';
import './style.scss';

// #region -------------- Interfaces --------------------------------------------------------------

export enum Size {
  Sm = 'mh-sm',
  Md = '',
  Lg = 'mh-lg',
}

export interface IProps {
  className?: string;
  full?: boolean;
  size?: Size;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export const Content: React.SFC<IProps> = (props) => {
  const { children, className, full, size } = props;

  return (
    <div className={classnames('mh-content', className, {
      'mh-full': full,
    }, size)}>
      {children}
    </div>
  );
};

// #endregion
