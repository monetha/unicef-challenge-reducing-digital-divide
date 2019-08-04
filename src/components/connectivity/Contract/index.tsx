import classnames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { IAsyncState } from 'src/core/redux/asyncAction';
import { translate } from 'src/i18n';
import { IContract, IFactReportEntry } from 'src/models/contract';
import { IISP } from 'src/models/isp';
import { loadReportingHistory, reportFact } from 'src/state/contract/action';
import { loadISP } from 'src/state/isp/action';
import { IState } from 'src/state/rootReducer';
import { getEtherscanUrl } from 'src/utils/address';
import { getColorClassByScore } from 'src/utils/score';
import { Address } from 'verifiable-data';
import { LineChart, XAxis, YAxis, CartesianGrid, Line, Legend } from 'recharts';
import './style.scss';
import moment from 'moment';
import { Table } from 'src/components/layout/Table';
import { Tbody, Td, Th, Thead, Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

// #region -------------- Interfaces --------------------------------------------------------------

interface IStateProps {
  isp: IAsyncState<IISP>;
  historicalData: IAsyncState<IFactReportEntry[]>;
  reportSpeedStatus: IAsyncState<void>;
}

interface IDispatchProps {
  loadISP(address: Address);
  loadReportingHistory();
  reportSpeed(speed: number);
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

        {this.renderDashboard()}
      </div>
    );
  }

  private renderDashboard() {
    const { historicalData } = this.props;

    if (!historicalData || !historicalData.data) {
      return null;
    }

    return (
      <div className='mh-dashboard'>
        {this.renderChart(historicalData.data)}
        {this.renderHistory(historicalData.data)}
      </div>
    );
  }

  private renderChart(entries: IFactReportEntry[]) {
    const { contract } = this.props;

    const chartData = entries.map(e => ({
      date: moment(e.date).format('MM-DD'),
      contractSpeed: contract.speed,
      schoolSpeed: e.schoolSpeed,
      ispSpeed: e.ispSpeed,
    }));

    return (
      <LineChart width={500} height={300} data={chartData}>
        <XAxis dataKey='date' />
        <YAxis />
        <CartesianGrid stroke='#eee' strokeDasharray='5 5' />
        <Legend verticalAlign='top' height={36} />
        <Line name={translate(t => t.contract.contractSpeed)} type='monotone' dataKey='contractSpeed' stroke='#339966' />
        <Line name={translate(t => t.contract.schoolReport)} type='monotone' dataKey='schoolSpeed' stroke='#8884d8' />
        <Line name={translate(t => t.contract.ispReport)} type='monotone' dataKey='ispSpeed' stroke='#82ca9d' />
      </LineChart>
    );
  }

  private renderHistory(entries: IFactReportEntry[]) {
    const { contract } = this.props;

    return (
      <Table>
        <Thead>
          <Tr>
            <Th>{translate(t => t.common.date)}</Th>
            <Th>{translate(t => t.contract.schoolReport)} (MB/s)</Th>
            <Th>{translate(t => t.contract.ispReport)} (MB/s)</Th>
            <Th>{translate(t => t.contract.complience)}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {entries.map(e => (
            <Tr key={e.date.toString()}>
              <Td>{moment(e.date).format('YYYY-MM-DD')}</Td>
              <Td>{e.schoolSpeed}</Td>
              <Td>{e.ispSpeed}</Td>
              <Td>{this.renderComplience(contract.speed, e.schoolSpeed, e.ispSpeed)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  }

  private renderComplience(contractSpeed: number, schoolSpeed: number, _ispSpeed: number) {
    if (schoolSpeed === null || schoolSpeed === undefined) {
      return 'N/A';
    }

    // TODO: include ispSpeed in formula

    return `${Math.round(100 / contractSpeed * schoolSpeed)}%`;
  }
}

// #endregion

// #region -------------- Connect -------------------------------------------------------------------

const connected = connect<IStateProps, IDispatchProps, IProps, IState>(
  (state, ownProps) => {
    const { loaded } = state.isp;
    const { factReportingHistory, factReportingStatus } = state.contract;

    const isp = loaded[ownProps.contract.ispAddress];
    const historicalData = factReportingHistory[ownProps.contract.id];
    const reportSpeedStatus = factReportingStatus[ownProps.contract.id];

    return {
      isp,
      historicalData,
      reportSpeedStatus,
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
