import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Content, Size } from 'src/components/layout/Content';
import { MainTemplate } from 'src/components/layout/MainTemplate';
import { IState } from 'src/state/rootReducer';
import './style.scss';

// #region -------------- Interfaces --------------------------------------------------------------

interface IStateProps {
}

interface IDispatchProps {
}

interface IProps extends RouteComponentProps<any>, IStateProps, IDispatchProps {
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class CreateISPPage extends React.Component<IProps> {
  public render() {
    return (
      <MainTemplate className='mh-create-isp-page'>
        <Content size={Size.Md}>
          Create ISP
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
)(CreateISPPage);

export { connected as CreateISPPage };

// #endregion
