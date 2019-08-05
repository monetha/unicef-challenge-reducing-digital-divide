import React from 'react';
import './style.scss';
import classnames from 'classnames';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps extends React.HTMLProps<HTMLInputElement> {
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export class TextInput extends React.PureComponent<IProps> {

  public render() {
    const { className, ...rest } = this.props;

    return (
      <input
        type='text'
        className={classnames({
          'mh-text-input': true,
        }, className)}
        {...rest}
      />
    );
  }
}

// #endregion
