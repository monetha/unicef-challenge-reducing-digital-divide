import React from 'react';
import './style.scss';
import { Content } from 'src/components/layout/Content';
import { translate } from 'src/i18n';

const logoImgUrl = require('src/assets/images/unicef-logo.svg');

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
            <a href='https://www.unicef.org' target='_blank'>
              <img src={logoImgUrl} />
            </a>
          </div>

          <div className='mh-copyright'>
            <a href='https://www.monetha.io/platform' target='_blank'>
              {translate(t => t.footer.copyright)}
            </a>
          </div>
        </div>
      </Content>
    </div>
  )
};

// #endregion
