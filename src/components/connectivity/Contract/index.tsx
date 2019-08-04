import React from 'react';
import { connect } from 'react-redux';
import { IState } from 'src/state/rootReducer';
import './style.scss';
import { IContract } from 'src/models/contract';
import { translate } from 'src/i18n';
import { getEtherscanUrl } from 'src/utils/address';
import { IAsyncState } from 'src/core/redux/asyncAction';
import { IISP } from 'src/models/isp';
import { Address } from 'verifiable-data';
import { loadISP } from 'src/state/isp/action';

// #region -------------- Interfaces --------------------------------------------------------------

interface IStateProps {
  isp: IAsyncState<IISP>;
}

interface IDispatchProps {
  loadISP(address: Address);
}

interface ICombinedProps extends IStateProps, IDispatchProps, IProps {
}

export interface IProps {
  contract: IContract;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class Contract extends React.Component<ICombinedProps> {
  public constructor(props) {
    super(props);
  }

  public componentDidMount() {
    const { contract, loadISP: loadISPProp } = this.props;

    loadISPProp(contract.ispAddress);
  }

  public render() {
    const { contract, isp } = this.props;

    if (!isp || !isp.data) {
      return null;
    }

    return (
      <div className='mh-contract'>
        <h3>{translate(t => t.school.contractWith)} {isp.data.name}</h3>

        <div>
          <b>{translate(t => t.isp.address)}: </b>
          <a href={getEtherscanUrl(contract.ispAddress)} target='_blank'>{contract.ispAddress}</a>
        </div>

        <div>
          <b>{translate(t => t.school.minSpeed)}: </b>
          <span>{contract.speed} MB/s</span>
        </div>
      </div>
    );
  }
}

// #endregion

// #region -------------- Connect -------------------------------------------------------------------

const connected = connect<IStateProps, IDispatchProps, IProps, IState>(
  (state, ownProps) => {
    const { loaded } = state.isp;

    const isp = loaded[ownProps.contract.ispAddress];

    return {
      isp,
    };
  },
  (dispatch) => {
    return {
      loadISP: (address: Address) => {
        dispatch(loadISP.init(address, { cacheTimeout: -1 }))
      },
    };
  },
)(Contract);

export { connected as Contract };

// #endregion
