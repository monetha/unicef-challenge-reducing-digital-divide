import { Form, Formik } from 'formik';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'src/components/form/Button';
import { FormikField } from 'src/components/form/FormikField';
import { TextInput } from 'src/components/form/TextInput';
import { IAsyncState } from 'src/core/redux/asyncAction';
import { translate } from 'src/i18n';
import { IContract } from 'src/models/contract';
import { reportFact } from 'src/state/contract/action';
import { IState } from 'src/state/rootReducer';
import * as Yup from 'yup';
import './style.scss';
import { Loader } from 'src/components/indicators/Loader';
import { Alert, AlertType } from 'src/components/indicators/Alert';

// #region -------------- Interfaces --------------------------------------------------------------

interface IStateProps {
  reportingStatus: IAsyncState<void>;
}

interface IDispatchProps {
  reportSpeed(values: IFormValues);
}

interface ICombinedProps extends IStateProps, IDispatchProps, IProps {
}

export interface IProps {
  contract: IContract;
}

interface IFormValues {
  speed: string;
}

// #endregion

// #region -------------- Form validation schema -------------------------------------------------------------------

const validationSchema = Yup.object().shape({
  speed: Yup.number()
    .typeError(translate(t => t.errors.mustBeNumber))
    .required(translate(t => t.errors.required))
    .positive(translate(t => t.errors.mustBePositiveNumber)),
});

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class ReportSpeedForm extends React.PureComponent<ICombinedProps> {
  private initialValues: IFormValues;
  private showErrorsSince = new Date();

  public constructor(props) {
    super(props);

    this.initialValues = {
      speed: '',
    };
  }

  public render() {
    const { reportingStatus } = this.props;
    const isLoading = reportingStatus && reportingStatus.isFetching;

    return (
      <div className='mh-report-speed-form'>
        {isLoading && (
          <Loader
            fullArea={true}
            message={translate(t => t.common.txExecutionInProgress)}
          />
        )}

        {this.renderError()}

        <Formik<IFormValues>
          initialValues={this.initialValues}
          onSubmit={this.props.reportSpeed}
          validationSchema={validationSchema}
          validateOnChange
        >
          {this.renderForm}
        </Formik>
      </div>
    );
  }

  private renderForm = ({ handleChange, values }) => {
    const { reportingStatus } = this.props;
    const disabled = reportingStatus && reportingStatus.isFetching;

    return (
      <Form>
        <FormikField
          name='speed'
        >
          <TextInput
            name='speed'
            onChange={handleChange}
            value={values.speed}
            disabled={disabled}
            placeholder={`${translate(t => t.contract.factualSpeed)} Mbps`}
          />
        </FormikField>

        <Button type='submit'>
          {translate(t => t.common.submit)}
        </Button>
      </Form>
    );
  }

  private renderError() {
    const { reportingStatus } = this.props;
    if (!reportingStatus || reportingStatus.isFetching || !reportingStatus.error) {
      return null;
    }

    if (reportingStatus.errorTimestamp < this.showErrorsSince) {
      return null;
    }

    return (
      <Alert type={AlertType.Error}>
        {reportingStatus.error.friendlyMessage}
      </Alert>
    );
  }
}

// #endregion

// #region -------------- Connect -------------------------------------------------------------------

const connected = connect<IStateProps, IDispatchProps, IProps, IState>(
  (state, ownProps) => {
    const reportingStatus = state.contract.factReportingStatus[ownProps.contract.id];

    return {
      reportingStatus,
    };
  },
  (dispatch, ownProps) => {
    return {
      reportSpeed: (values: IFormValues) => {
        dispatch(reportFact.init({
          speed: Number(values.speed),
          contract: ownProps.contract,
        }));
      },
    };
  },
)(ReportSpeedForm);

export { connected as ReportSpeedForm };

// #endregion
