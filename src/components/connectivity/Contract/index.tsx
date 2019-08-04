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
import classnames from 'classnames';
import { getColorClassByScore } from 'src/utils/score';
import { loadReportingHistory, reportFact } from 'src/state/contract/action';

// #region -------------- Interfaces --------------------------------------------------------------

interface IStateProps {
  isp: IAsyncState<IISP>;
}

interface IDispatchProps {
  loadISP(address: Address);
  loadReportingHistory();
  reportSpeed: (speed: number);
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
    const { contract, loadISP: loadISPProp, loadReportingHistory: loadReportingHistoryProp } = this.props;

    loadISPProp(contract.ispAddress);
    loadReportingHistoryProp();
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

        <div>
          <b>{translate(t => t.school.contractComplience)}: </b>
          <span
            className={classnames('mh-complience-percent', getColorClassByScore(contract.connectivityScore))}
          >
            {Math.round((contract.connectivityScore || 0) * 100)}%
          </span>
        </div>
      </div>
    );
  }

  private renderDashboard() {

  }

  private renderChart() {

  }

  private renderHistory() {

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
  (dispatch, ownProps) => {
    return {
      loadISP: (address: Address) => {
        dispatch(loadISP.init(address, { cacheTimeout: -1 }));
      },
      loadReportingHistory: () => {
        dispatch(loadReportingHistory.init({
          contractId: ownProps.contract.id,
        }, { cacheTimeout: -1 }));
      },
      reportSpeed: (speed: number) => {
        dispatch(reportFact.init({
          contractId: ownProps.contract.id,
          speed,
        }));
      },
    };
  },
)(Contract);

export { connected as Contract };

// #endregion
