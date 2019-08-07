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
import { getEtherscanUrl, getPassportScannerUrl } from 'src/utils/address';
import { getColorClassByScore } from 'src/utils/score';
import { Address } from 'verifiable-data';
import { LineChart, XAxis, YAxis, CartesianGrid, Line, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import './style.scss';
import moment from 'moment';
import { Table } from 'src/components/layout/Table';
import { Tbody, Td, Th, Thead, Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Button } from 'src/components/form/Button';
import { DropdownIndicator } from 'src/components/indicators/DropdownIndicator';
import { ReportSpeedForm } from '../ReportSpeedForm';
import { Loader } from 'src/components/indicators/Loader';
import { MetadataItem } from 'src/components/text/MetadataItem';

// #region -------------- Interfaces --------------------------------------------------------------

interface IStateProps {
  isp: IAsyncState<IISP>;
  historicalData: IAsyncState<IFactReportEntry[]>;
  reportSpeedStatus: IAsyncState<void>;
}

interface IDispatchProps {
  loadISP(passportAddress: Address);
  loadReportingHistory();
  reportSpeed(speed: number);
}

interface ICombinedProps extends IStateProps, IDispatchProps, IProps {
}

export interface IProps {
  contract: IContract;
}

interface IComponentState {
  isReportingOpen: boolean;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class Contract extends React.Component<ICombinedProps, IComponentState> {
  public constructor(props) {
    super(props);

    this.state = {
      isReportingOpen: false,
    };
  }

  public componentDidMount() {
    const { contract, loadISP: loadISPProp, loadReportingHistory: loadReportingHistoryProp } = this.props;

    loadISPProp(contract.ispPassportAddress);
    loadReportingHistoryProp();
  }

  public render() {
    return (
      <div className='mh-contract'>
        {this.renderContractMetadata()}
        {this.renderDashboard()}
        {this.renderReporting()}
      </div>
    );
  }

  private renderContractMetadata() {
    const { contract, isp } = this.props;

    if (!isp || (!isp.data && isp.isFetching)) {
      return (
        <Loader />
      );
    }

    if (!isp.data) {
      return null;
    }

    return (
      <div className='mh-metadata'>
        <h3>{translate(t => t.school.contractWith)} {isp.data.name}</h3>

        <MetadataItem title={translate(t => t.isp.address)}>
          <a href={getEtherscanUrl(contract.ispAddress)} target='_blank'>{contract.ispAddress}</a>
        </MetadataItem>

        <MetadataItem title={translate(t => t.isp.passport)}>
          <a href={getPassportScannerUrl(contract.ispPassportAddress)} target='_blank'>{contract.ispPassportAddress}</a>
        </MetadataItem>

        <MetadataItem title={translate(t => t.school.minSpeed)}>
          <span>{contract.speed} Mbps</span>
        </MetadataItem>

        <MetadataItem title={translate(t => t.school.contractComplience)}>
          <span
            className={classnames('mh-complience-percent', getColorClassByScore(contract.connectivityScore))}
          >
            {Math.round((contract.connectivityScore || 0) * 100)}%
          </span>
        </MetadataItem>
      </div>
    );
  }

  private renderDashboard() {
    const { historicalData } = this.props;

    if (!historicalData || (!historicalData.data && historicalData.isFetching)) {
      return (
        <Loader />
      );
    }

    if (!historicalData.data) {
      return null;
    }

    return (
      <div className='mh-dashboard'>
        {historicalData.isFetching && (
          <Loader fullArea={true} />
        )}

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
      <div className='mh-linechart'>
        <h4>{translate(t => t.contract.speedOverTime)}</h4>
        <div className='mh-linechart-content'>
          <ResponsiveContainer minHeight={300}>
            <LineChart data={chartData} >
              <XAxis dataKey='date'/>
              <YAxis />
              <CartesianGrid stroke='#eee' strokeDasharray='5 5' />
              <Legend verticalAlign='bottom' height={60} />
              <ReferenceLine y={contract.speed} stroke='#f6009d' strokeDasharray='5 5' />
              <Line name={translate(t => t.contract.contractSpeed)} type='monotone' dataKey='contractSpeed' stroke='#f6009d' dot={false} />
              <Line name={translate(t => t.contract.schoolReport)} type='monotone' dataKey='schoolSpeed' stroke='#ffbe00' />
              <Line name={translate(t => t.contract.ispReport)} type='monotone' dataKey='ispSpeed' stroke='#0072ff' />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  private renderHistory(entries: IFactReportEntry[]) {
    const { contract } = this.props;

    return (
      <div className='mh-history'>
        <h4>{translate(t => t.contract.speedReportHistory)}</h4>

        <Table>
          <Thead>
            <Tr>
              <Th>{translate(t => t.common.date)}</Th>
              <Th>{translate(t => t.contract.schoolReport)} (Mbps)</Th>
              <Th>{translate(t => t.contract.ispReport)} (Mbps)</Th>
              <Th>{translate(t => t.contract.complience)}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {entries.map(e => (
              <Tr key={e.date.toString()}>
                <Td>{moment(e.date).format('YYYY-MM-DD')}</Td>
                <Td>{e.schoolSpeed === undefined ? '-' : e.schoolSpeed}</Td>
                <Td>{e.ispSpeed === undefined ? '-' : e.ispSpeed}</Td>
                <Td>{this.renderComplience(contract.speed, e.schoolSpeed, e.ispSpeed)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    );
  }

  private renderComplience(contractSpeed: number, schoolSpeed: number, _ispSpeed: number) {
    if (schoolSpeed === null || schoolSpeed === undefined) {
      return 'N/A';
    }

    return `${Math.round(100 / contractSpeed * schoolSpeed)}%`;
  }

  // #region -------------- Reporting -------------------------------------------------------------------

  private renderReporting() {
    const { isReportingOpen } = this.state;
    const { contract } = this.props;

    if (!isReportingOpen) {
      return (
        <div className='mh-speed-reporting'>
          <Button
            type='button'
            onClick={this.onReportSpeedExpandToggle}
          >
            {translate(t => t.contract.reportSpeed)}
          </Button>
        </div>
      );
    }

    return (
      <div className='mh-speed-reporting'>
        <h3
          onClick={this.onReportSpeedExpandToggle}
          className='mh-report-form-header'
        >
          <DropdownIndicator isOpened={true} />
          <div>
            {translate(t => t.contract.reportSpeed)}
          </div>
        </h3>

        <div>
          <ReportSpeedForm
            contract={contract}
          />
        </div>
      </div>
    );
  }

  private onReportSpeedExpandToggle = () => {
    const { isReportingOpen } = this.state;

    this.setState({
      isReportingOpen: !isReportingOpen,
    });
  }

  // #endregion
}

// #endregion

// #region -------------- Connect -------------------------------------------------------------------

const connected = connect<IStateProps, IDispatchProps, IProps, IState>(
  (state, ownProps) => {
    const { loaded } = state.isp;
    const { factReportingHistory, factReportingStatus } = state.contract;

    const isp = loaded[ownProps.contract.ispPassportAddress];
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
      loadISP: (passportAddress: Address) => {
        dispatch(loadISP.init(passportAddress, { cacheTimeout: -1 }));
      },
      loadReportingHistory: () => {
        dispatch(loadReportingHistory.init({
          contract: ownProps.contract,
        }, { cacheTimeout: -1 }));
      },
      reportSpeed: (speed: number) => {
        dispatch(reportFact.init({
          contract: ownProps.contract,
          speed,
        }));
      },
    };
  },
)(Contract);

export { connected as Contract };

// #endregion
