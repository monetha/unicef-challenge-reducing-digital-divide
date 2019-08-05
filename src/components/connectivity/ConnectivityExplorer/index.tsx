import classnames from 'classnames';
import find from 'lodash/find';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import memoizeOne from 'memoize-one';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Button } from 'src/components/form/Button';
import { Alert, AlertType } from 'src/components/indicators/Alert';
import { Collapsible } from 'src/components/layout/Collapsible';
import { Country } from 'src/constants/countries';
import { translate } from 'src/i18n';
import { ContractState, IContract } from 'src/models/contract';
import { ISchool } from 'src/models/school';
import { loadContracts } from 'src/state/contract/action';
import { IContractState } from 'src/state/contract/reducer';
import { loadISPs } from 'src/state/isp/action';
import { IState } from 'src/state/rootReducer';
import { loadSchools } from 'src/state/school/action';
import { ISchoolState } from 'src/state/school/reducer';
import { getEtherscanUrl } from 'src/utils/address';
import './style.scss';
import { Contract } from '../Contract';
import { getColorClassByScore } from 'src/utils/score';
import { Address } from 'verifiable-data';
import { DropdownIndicator } from 'src/components/indicators/DropdownIndicator';
import { ContractForm } from '../ContractForm';

// #region -------------- Interfaces --------------------------------------------------------------

interface IConnectivityTree {
  countries: ICountryConnectivity[];
}

interface ICountryConnectivity {
  code: Country;
  connectivityScore?: number;
  schools: ISchoolConnectivity[];
}

interface ISchoolConnectivity {
  data: ISchool;
  connectivityScore?: number;
  contract?: IContract;
}

interface IStateProps {
  tree: IConnectivityTree;
}

interface IDispatchProps {
  loadTree();
}

interface IProps extends IStateProps, IDispatchProps {
}

interface IComponentState {
  openedContractFormSchool: Address;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class ConnectivityExplorer extends React.Component<IProps, IComponentState> {
  public constructor(props) {
    super(props);

    this.state = {
      openedContractFormSchool: null,
    };
  }

  public componentDidMount() {
    this.props.loadTree();
  }

  public render() {
    return (
      <div className='mh-connectivity-explorer'>
        {this.renderCountries()}
      </div>
    );
  }

  private renderCountries() {
    const { tree } = this.props;

    if (!tree) {
      return null;
    }

    return tree.countries.map(country => {
      return (
        <Fragment key={country.code}>
          {this.renderCountry(country)}
        </Fragment>
      );
    });
  }

  private renderCountry(country: ICountryConnectivity) {
    return (
      <Collapsible
        header={this.renderHeader(translate(t => t.countries[country.code]), country.connectivityScore)}
      >
        {country.schools.map(s => (
          <Fragment key={s.data.address}>
            {this.renderSchool(s)}
          </Fragment>
        ))}
      </Collapsible>
    );
  }

  private renderSchool(school: ISchoolConnectivity) {
    const colorClass = getColorClassByScore(school.connectivityScore);

    return (
      <Collapsible
        header={this.renderHeader(school.data.name, school.connectivityScore)}
      >
        <div className={classnames('mh-school-node-contents', colorClass)}>
          <h3>{school.data.name}</h3>
          <b>{translate(t => t.school.address)}: </b>
          <a href={getEtherscanUrl(school.data.address)} target='_blank'>{school.data.address}</a>

          {this.renderContract(school.contract, school.data)}
        </div>
      </Collapsible>
    );
  }

  private renderHeader(text: string, indicatorScore: number) {
    const colorClass = getColorClassByScore(indicatorScore);

    return (
      <div className='mh-tree-item-header'>
        <div className='mh-header-text'>{text}</div>
        <div className={classnames('mh-status-indicator', colorClass)}></div>
      </div>
    );
  }

  // #region -------------- Contract -------------------------------------------------------------------

  private renderContract(contract: IContract, school: ISchool) {
    if (!contract) {
      return (
        <div className='mh-contract-container'>
          <Alert type={AlertType.Warning}>
            <div>{translate(t => t.school.noContract)}</div>
          </Alert>

          {this.renderContractCreation(school)}
        </div>
      );
    }

    return (
      <div className='mh-contract-container'>
        <Contract contract={contract} />
      </div>
    );
  }

  private renderContractCreation(school: ISchool) {
    const { openedContractFormSchool } = this.state;

    if (openedContractFormSchool !== school.address) {
      return (
        <Button
          type='button'
          data-school-address={school.address}
          onClick={this.onCreateContractClick}
        >
          {translate(t => t.school.createContract)}
        </Button>
      );
    }

    return (
      <div>
        <h3
          data-school-address={school.address}
          onClick={this.onCreateContractClick}
          className='mh-create-contract-header'
        >
          <DropdownIndicator isOpened={true} />
          <div>
            {translate(t => t.school.createContract)}
          </div>
        </h3>

        <div>
          <ContractForm school={school} />
        </div>
      </div>
    );
  }

  private onCreateContractClick = (e: React.MouseEvent<HTMLElement>) => {
    const { openedContractFormSchool } = this.state;

    const schoolAddress = e.currentTarget.dataset.schoolAddress;

    this.setState({
      openedContractFormSchool: schoolAddress === openedContractFormSchool ? null : schoolAddress,
    });
  }

  // #endregion
}

// #endregion

// #region -------------- Connect -------------------------------------------------------------------

const connected = connect<IStateProps, IDispatchProps, any, IState>(
  (state) => {
    const { school, contract } = state;

    return {
      tree: createTree(school, contract),
    };
  },
  (dispatch) => {
    return {
      loadTree: () => {
        dispatch(loadSchools.init());
        dispatch(loadISPs.init());
        dispatch(loadContracts.init());
      },
    };
  },
)(ConnectivityExplorer);

export { connected as ConnectivityExplorer };

// #endregion

// #region -------------- Tree structure creation -------------------------------------------------------------------

const createTree = memoizeOne((schoolState: ISchoolState, contractState: IContractState): IConnectivityTree => {
  const allSchools = map(schoolState.loaded, s => s.data).filter(s => s);
  const schoolsByCountries = groupBy(allSchools, (value) => value && value.country);

  const tree: IConnectivityTree = {
    countries: [],
  };

  for (const country in schoolsByCountries) {
    if (!schoolsByCountries.hasOwnProperty(country)) {
      continue;
    }

    let countryScoreSum = 0;
    const schoolsConnectivity: ISchoolConnectivity[] = [];
    const schools = schoolsByCountries[country];

    schools.forEach(school => {

      // Find active contract for school
      const contract = find(contractState.loaded, c =>
        c.data && c.data.state === ContractState.Active && c.data.schoolAddress === school.address);

      const schoolConnectivity: ISchoolConnectivity = {
        connectivityScore: contract && contract.data.connectivityScore,
        contract: contract && contract.data,
        data: school,
      };

      if (schoolConnectivity.connectivityScore) {
        countryScoreSum += schoolConnectivity.connectivityScore;
      }

      schoolsConnectivity.push(schoolConnectivity);
    });

    tree.countries.push({
      code: country as Country,
      connectivityScore: countryScoreSum / schools.length,
      schools: schoolsConnectivity,
    });
  }

  return tree;
});

// #endregion
