import React from 'react';
import './style.scss';
import { Content } from 'src/components/layout/Content';
import { translate } from 'src/i18n';

const logoImgUrl = require('src/assets/images/logo-white.svg');

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps {
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export const Footer: React.SFC<IProps> = () => {
  return (
    <div className='mh-footer'>
      <Content>
        <div className='mh-footer-info'>
          <div className='mh-logo'>
            <a href='https://www.monetha.io'>
              <img src={logoImgUrl} />
            </a>
          </div>

          <div className='mh-copyright'>
            {translate(t => t.footer.copyright)}
          </div>
        </div>
      </Content>
    </div>
  )
};

// #endregion
