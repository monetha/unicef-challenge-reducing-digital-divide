import { AsyncState } from 'core/redux/asyncAction';
import { Form, Formik } from 'formik';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Button } from 'src/components/form/Button';
import { FormikField } from 'src/components/form/FormikField';
import { TextInput } from 'src/components/form/TextInput';
import { Alert, AlertType } from 'src/components/indicators/Alert';
import { Loader } from 'src/components/indicators/Loader';
import { Content, Size } from 'src/components/layout/Content';
import { MainTemplate } from 'src/components/layout/MainTemplate';
import { FormWrapper } from 'src/components/text/FormWrapper';
import { translate } from 'src/i18n';
import { createISP } from 'src/state/isp/action';
import { CreateISPStatuses, ICreateISPStatus } from 'src/state/isp/reducer';
import { IState } from 'src/state/rootReducer';
import { getPassportScannerUrl } from 'src/utils/address';
import * as Yup from 'yup';
import './style.scss';
import { Description } from 'src/components/text/Description';

// #region -------------- Interfaces --------------------------------------------------------------

interface IFormValues {
  name: string;
}

interface IDispatchProps {
  onSubmit(values: IFormValues);
}

interface IStateProps {
  status: AsyncState<void>;
  progress: ICreateISPStatus;
}

interface ICombinedProps extends RouteComponentProps<any>, IDispatchProps, IStateProps {
}

// #endregion

// #region -------------- Form validation schema -------------------------------------------------------------------

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required(translate(t => t.errors.required)),
});

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class CreateISPPage extends React.Component<ICombinedProps> {
  private readonly initialValues: IFormValues = {
    name: '',
  };

  private showAlertsSince = new Date();
  private resetForm: () => any;

  public componentDidUpdate(prevProps: ICombinedProps) {

    // Check if form was just submitted successfully. If yes - reset form
    const { status } = this.props;
    if (status && !status.isFetching && status.isFetched && !status.error &&
      (!prevProps.status || prevProps.status.isFetching)) {

      if (this.resetForm) {
        this.resetForm();
      }
    }
  }

  public render() {
    return (
      <MainTemplate className='mh-create-isp-page'>
        <Content size={Size.Md}>
          <Description>
            {translate(t => t.pages.createISP.description)}
          </Description>

          <FormWrapper header={translate(t => t.nav.createISP)}>
            {this.renderError()}
            {this.renderSuccess()}
            {this.renderLoader()}

            <Formik<IFormValues>
              initialValues={this.initialValues}
              onSubmit={this.props.onSubmit}
              validationSchema={validationSchema}
              validateOnChange
            >
              {this.renderForm}
            </Formik>
          </FormWrapper>
        </Content>
      </MainTemplate>
    );
  }

  private renderForm = ({ handleChange, values, resetForm }) => {
    const { status } = this.props;
    this.resetForm = resetForm;

    const disabled = status && status.isFetching;

    return (
      <Form>
        <FormikField
          name='name'
        >
          <TextInput
            name='name'
            onChange={handleChange}
            value={values.name}
            placeholder={translate(t => t.isp.enterName)}
            disabled={disabled}
          />
        </FormikField>

        <div className='mh-button-wrapper'>
          <Button
            type='submit'
            disabled={disabled}
          >
            {translate(t => t.nav.createISP)}
          </Button>
        </div>
      </Form>
    );
  }

  private renderLoader() {
    const { status, progress } = this.props;
    const isLoading = status && status.isFetching;

    if (!isLoading) {
      return null;
    }

    return (
      <Loader
        fullArea={true}
        message={progress && getStatusText(progress.status)}
      />
    );
  }

  private renderError() {
    const { status } = this.props;
    if (!status || status.isFetching || !status.error) {
      return null;
    }

    if (status.errorTimestamp < this.showAlertsSince) {
      return null;
    }

    return (
      <Alert type={AlertType.Error}>
        {status.error.friendlyMessage}
      </Alert>
    );
  }

  private renderSuccess() {
    const { status, progress } = this.props;
    if (!status || status.isFetching || !status.isFetched || status.error ||
      !progress || !progress.identityAddress) {
      return null;
    }

    if (status.timestamp < this.showAlertsSince) {
      return null;
    }

    return (
      <Alert type={AlertType.Success}>
        {translate(t => t.isp.success)}
        <div>
          <a
            href={getPassportScannerUrl(progress.identityAddress)}
            target='_blank'
          >
            {progress.identityAddress}
          </a>
        </div>
      </Alert>
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
      status: state.isp.creationStatus,
      progress: state.isp.creationProgress,
    };
  },
  dispatch => {
    return {
      onSubmit(values: IFormValues) {
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
