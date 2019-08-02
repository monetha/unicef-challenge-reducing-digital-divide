import React from 'react';
import { Table as ResponsiveTable } from 'react-super-responsive-table';
import './style.scss';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps {
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export const Table: React.SFC<IProps> = (props) => {
  return (
    <div className='mh-table'>
      <ResponsiveTable>
        {props.children}
      </ResponsiveTable>
    </div>
  );
};

// #endregion
