import classnames from 'classnames';
import queryString from 'query-string';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Tooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';
import { DropdownIndicator } from 'src/components/indicators/DropdownIndicator';
import { ethNetworkUrls } from 'src/constants/api';
import { translate } from 'src/i18n';
import { registerBlockchainServices } from 'src/ioc/bootstrapIOC';
import { getServices } from 'src/ioc/services';
import './style.scss';

// #region -------------- Interfaces -------------------------------------------------------------------

interface IProps extends RouteComponentProps<any> {
}

interface IState {
  isOpen: boolean;
}

// #endregion

// #region -------------- Component -------------------------------------------------------------------

class NetworkPicker extends React.Component<IProps, IState> {

  public constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };
  }

  public render() {

    return (
      <div className='mh-network-picker'>
        {this.renderSelected()}
      </div>
    );
  }

  // #region -------------- Selected box -------------------------------------------------------------------

  private renderSelected() {
    const { isOpen } = this.state;

    return (
      <Tooltip
        position='bottom'
        distance={-2}
        offset={-70}
        theme='light'
        animateFill={false}
        trigger='click'
        open={this.state.isOpen}
        onRequestClose={() => this.onOpenToggle(false)}
        interactive={true}
        arrow={false}
        hideOnClick={true}
        html={this.renderPopupContents()}
      >
        <div
          className={classnames('mh-selected-network-box', {
            'mh-is-open': isOpen,
          })}
          onClick={this.onSelectedBoxClick}
        >
          <div>
            <div className='mh-value'>
              {this.getSelectedNetworkInfo().name}
            </div>
          </div>
          <DropdownIndicator isOpened={isOpen} />
        </div>
      </Tooltip>
    );
  }

  private getSelectedNetworkInfo() {
    const { ethNetworkUrl } = getServices();

    switch (ethNetworkUrl) {
      case ethNetworkUrls.mainnet:
        return {
          url: ethNetworkUrl,
          name: translate(t => t.ethereum.mainnet),
          alias: 'mainnet',
        };

      case ethNetworkUrls.ropsten:
        return {
          url: ethNetworkUrl,
          name: translate(t => t.ethereum.ropsten),
          alias: 'ropsten',
        };

      default:
        return {
          url: ethNetworkUrl,
          name: ethNetworkUrl,
        };
    }
  }

  private onSelectedBoxClick = () => {
    this.onOpenToggle();
  }

  private onOpenToggle = (value?: boolean) => {
    this.setState({
      isOpen: value !== undefined ? !!value : !this.state.isOpen,
    });
  }

  // #endregion

  // #region -------------- Popup -------------------------------------------------------------------

  private renderPopupContents() {
    const selectedNetInfo = this.getSelectedNetworkInfo();

    return (
      <div className='mh-network-picker-popup-content'>
        <div>
          <button
            type='button'
            data-url={ethNetworkUrls.mainnet}
            disabled={selectedNetInfo.alias === 'mainnet'}
            onClick={this.onNetworkButtonClick}
          >
            {translate(t => t.ethereum.mainnet)}
          </button>
        </div>

        <div>
          <button
            type='button'
            data-url={ethNetworkUrls.ropsten}
            disabled={selectedNetInfo.alias === 'ropsten'}
            onClick={this.onNetworkButtonClick}
          >
            {translate(t => t.ethereum.ropsten)}
          </button>
        </div>
      </div>
    );
  }

  private onNetworkButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.onNetworkChange(e.currentTarget.dataset.url);
  }

  private onNetworkChange = (url: string) => {
    if (!url || !url.trim()) {
      return;
    }

    const newUrl = url.trim();

    registerBlockchainServices(getServices(), newUrl);

    const { location, history } = this.props;
    const newQueryParams = { ...queryString.parse(location.search) };

    switch (newUrl) {
      case ethNetworkUrls.mainnet:
        newQueryParams.network = 'mainnet';
        break;

      case ethNetworkUrls.ropsten:
        newQueryParams.network = 'ropsten';
        break;

      default:
        newQueryParams.network = newUrl;
        break;
    }

    const newSearch = queryString.stringify(newQueryParams);
    const newPageUrl = `${location.pathname}?${newSearch}`;

    history.replace(newPageUrl);

    this.onOpenToggle(false);
  }

  // #endregion
}

// #endregion

const router = withRouter(NetworkPicker);
export { router as NetworkPicker };
