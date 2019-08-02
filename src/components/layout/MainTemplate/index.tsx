import React from 'react';
import { NavBar } from 'src/components/nav/NavBar';
import './style.scss';
import { Footer } from 'src/components/nav/Footer';
import classnames from 'classnames';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps {
  className?: string;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export const MainTemplate: React.SFC<IProps> = (props) => {
  const { className } = props;

  return (
    <div className={classnames('mh-main-template', className)}>
      <NavBar />

      <div className='mh-template-content'>
        {props.children}
      </div>

      <Footer />
    </div>
  )
};

// #endregion
