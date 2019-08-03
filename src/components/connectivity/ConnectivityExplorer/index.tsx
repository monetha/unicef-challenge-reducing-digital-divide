import find from 'lodash/find';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import memoizeOne from 'memoize-one';
import React from 'react';
import { connect } from 'react-redux';
import { Country } from 'src/constants/countries';
import { ContractState, IContract } from 'src/models/contract';
import { ISchool } from 'src/models/school';
import { loadContracts } from 'src/state/contract/action';
import { IContractState } from 'src/state/contract/reducer';
import { loadISPs } from 'src/state/isp/action';
import { IState } from 'src/state/rootReducer';
import { loadSchools } from 'src/state/school/action';
import { ISchoolState } from 'src/state/school/reducer';
import './style.scss';

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

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class ConnectivityExplorer extends React.Component<IProps> {
  public componentDidMount() {
    this.props.loadTree();
  }

  public render() {
    const { tree } = this.props;

    return (
      <div>
        Connectivity explorer:
        {JSON.stringify(tree)}
      </div>
    );
  }
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
