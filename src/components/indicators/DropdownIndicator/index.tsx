import React from 'react';
import './style.scss';

interface IProps {
  isOpened: boolean;
}

export class DropdownIndicator extends React.PureComponent<IProps> {

  public render() {
    return (
      <div className={`mh-dropdown-indicator ${this.props.isOpened ? 'is-opened' : ''}`} />
    );
  }
}
