import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Content, Size } from 'src/components/layout/Content';
import { MainTemplate } from 'src/components/layout/MainTemplate';
import { IState } from 'src/state/rootReducer';
import './style.scss';
import { translate } from 'src/i18n';
import { Form, Formik } from 'formik';
import { FormWrapper } from 'src/components/text/FormWrapper';
import { TextInput } from 'src/components/form/TextInput';
import { Button } from 'src/components/form/Button';
import { createISP } from 'src/state/isp/action';
import { ICreateISPStatus, CreateISPStatuses } from 'src/state/isp/reducer';
import { AsyncState } from 'core/redux/asyncAction';
import { getEtherscanUrl } from 'src/utils/address';

// #region -------------- Interfaces --------------------------------------------------------------

interface IInitialValues {
  name: string;
}

interface IDispatchProps {
  onSubmit(values: IInitialValues);
}

interface IStateProps {
  status: AsyncState<ICreateISPStatus>;
}

interface IProps extends RouteComponentProps<any>, IDispatchProps, IStateProps {
  status: AsyncState<ICreateISPStatus>;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class CreateISPPage extends React.Component<IProps> {
  private readonly initialValues: IInitialValues = {
    name: '',
  };

  private renderForm = ({ handleChange, values }) => {
    const { status } = this.props;
    let statusText = '';
    let statusId: CreateISPStatuses;
    let url = '';
    let identityAddress = '';
    if (status.isFetched && status.data[values.name] !== undefined) {
      if (status.data[values.name].status) {
        statusId = status.data[values.name].status;
        statusText = getStatusText(statusId);
      }
      if (status.data[values.name].identityAddress) {
        identityAddress = status.data[values.name].identityAddress;
        url = getEtherscanUrl(identityAddress);
      }
    }
    const disabled = statusId === CreateISPStatuses.CreatingPassport ||
      statusId === CreateISPStatuses.ClaimingOwnership ||
      statusId === CreateISPStatuses.SubmittingMetadata;

    return (
      <Form>
        <h1 style={{ color: 'red' }}>{statusText}</h1>
        <TextInput
          name='name'
          onChange={handleChange}
          value={values.name}
          placeholder=''
        />
        <div className='mh-button-wrapper'>
          <Button
            type='submit'
            disabled={disabled}
          >
            {translate(t => t.nav.createISP)}
          </Button>
        </div>
        {identityAddress && url &&
        <div className='identity-address'>
          <span className='identity-created'>{`${translate(t => t.isp.identityCreated)}: `}</span>
          <a href={url} target='_blank'>{identityAddress}</a>
        </div>}
      </Form>
    );
  }

  public render() {
    return (
      <MainTemplate className='mh-create-isp-page'>
        <Content size={Size.Md}>
          <FormWrapper header={translate(t => t.nav.createISP)}>
            <Formik<IInitialValues>
              initialValues={this.initialValues}
              onSubmit={this.props.onSubmit}
            >
              {this.renderForm}
            </Formik>
          </FormWrapper>
        </Content>
      </MainTemplate>
    );
  }
}

// #endregion

const getStatusText = (status: CreateISPStatuses): string => {
  if (!status) {
    return '';
  }

  if (status === CreateISPStatuses.MetadataSubmitted) {
    return translate(t => t.isp.success);
  }

  if (status === CreateISPStatuses.ClaimingOwnership) {
    return translate(t => t.isp.claimingOwnership);
  }

  if (status === CreateISPStatuses.SubmittingMetadata) {
    return translate(t => t.isp.submittingMetadata);
  }

  return translate(t => t.isp.creatingPassport);
};

// #region -------------- Connect -------------------------------------------------------------------

const connected = connect<IStateProps, IDispatchProps, RouteComponentProps<any>, IState>(
  (state: IState) => {
    return {
      status: state.isp.status,
    };
  },
  dispatch => {
    return {
      onSubmit(values: IInitialValues) {
        dispatch(createISP.init({
          name: values.name,
          score: 0.6,
        }));
      },
    };
  },
)(CreateISPPage);

export { connected as CreateISPPage };

// #endregion
