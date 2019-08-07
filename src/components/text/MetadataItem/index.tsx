import React from 'react';
import './style.scss';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps {
  title: string;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export class MetadataItem extends React.PureComponent<IProps> {
  public render() {
    const { children } = this.props;

    return (
      <div className='mh-metadata-item'>
        <div className='mh-title'>{this.props.title}</div>
        <div className='mh-contents'>
          {children}
        </div>
      </div>
    );
  }
}

// #endregion
