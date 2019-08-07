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

  public constructor(props) {
    super(props);

    this.initialValues = {
      speed: '',
    };
  }

  public render() {
    return (
      <div className='mh-contract-form'>
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
