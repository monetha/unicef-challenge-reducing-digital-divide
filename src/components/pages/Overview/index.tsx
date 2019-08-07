import React from 'react';
import './style.scss';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { IState } from 'src/state/rootReducer';
import { MainTemplate } from 'src/components/layout/MainTemplate';
import { Content, Size } from 'src/components/layout/Content';
import { ConnectivityExplorer } from 'src/components/connectivity/ConnectivityExplorer';
import { translate } from 'src/i18n';

// #region -------------- Interfaces --------------------------------------------------------------

interface IStateProps {
}

interface IDispatchProps {
}

interface IProps extends RouteComponentProps<any>, IStateProps, IDispatchProps {
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class OverviewPage extends React.Component<IProps> {
  public render() {
    return (
      <MainTemplate className='mh-overview-page'>
        <Content size={Size.Md}>
          <h1>{translate(t => t.pages.overview.title)}</h1>
          <ConnectivityExplorer />
        </Content>
      </MainTemplate>
    );
  }
}

// #endregion

// #region -------------- Connect -------------------------------------------------------------------

const connected = connect<IStateProps, IDispatchProps, RouteComponentProps<any>, IState>(
  () => {
    return {
    };
  },
  () => {
    return {
    };
  },
)(OverviewPage);

export { connected as OverviewPage };

// #endregion
