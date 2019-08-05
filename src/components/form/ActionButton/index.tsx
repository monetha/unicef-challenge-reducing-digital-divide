import React from 'react';
import './style.scss';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps {
  onClick();
  className: string;
  text: string;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export class ActionButton extends React.PureComponent<IProps> {
  public render() {
    return (
      <div className='mh-button-container'>
        <button
          type='button'
          onClick={this.props.onClick}
          className={this.props.className}
        >
          {this.props.text}
        </button>
      </div>
    );
  }
}

// #endregion
