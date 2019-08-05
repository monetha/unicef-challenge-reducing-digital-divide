import React from 'react';
import { DropdownIndicator } from 'src/components/indicators/DropdownIndicator';
import './style.scss';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps {
  header?: React.ReactNode;
}

interface IState {
  isOpened: boolean;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export class Collapsible extends React.PureComponent<IProps, IState> {
  public constructor(props) {
    super(props);

    this.state = {
      isOpened: false,
    };
  }

  public render() {
    const { isOpened } = this.state;
    const { children, header } = this.props;

    return (
      <div className='mh-collapsible'>
        <div
          onClick={this.onToggle}
          className='mh-collapsible-header'
        >
          <DropdownIndicator isOpened={isOpened} />
          {header}
        </div>

        {isOpened && (
          <div className='mh-collapsible-content'>
            {children}
          </div>
        )}
      </div>
    );
  }

  private onToggle = () => {
    this.setState({
      isOpened: !this.state.isOpened,
    });
  }
}

// #endregion
