import React from 'react';
import { connect } from 'react-redux';
import { ISchool } from 'src/models/school';
import { IState } from 'src/state/rootReducer';
import * as Yup from 'yup';
import './style.scss';
import { translate } from 'src/i18n';
import { Formik, Form } from 'formik';
import { Address } from 'verifiable-data';
import { FormikField } from 'src/components/form/FormikField';
import { TextInput } from 'src/components/form/TextInput';
import { IAsyncState } from 'src/core/redux/asyncAction';
import { createContract } from 'src/state/contract/action';
import { Button } from 'src/components/form/Button';
import { DropdownInput } from 'src/components/form/DropdownInput';
import { loadISPs } from 'src/state/isp/action';
import { IISP } from 'src/models/isp';
import forEach from 'lodash/forEach';
import { Loader } from 'src/components/indicators/Loader';
import { Alert, AlertType } from 'src/components/indicators/Alert';

// #region -------------- Interfaces --------------------------------------------------------------

interface IStateProps {
  creationStatus: IAsyncState<void>;
  isps: { [address: string]: IAsyncState<IISP> };
}

interface IDispatchProps {
  createContract(values: IFormValues);
  loadISPs();
}

interface ICombinedProps extends IStateProps, IDispatchProps, IProps {
}

export interface IProps {
  school: ISchool;
}

interface IFormValues {
  ispPassportAddress: Address;
  speed: string;
}

// #endregion

// #region -------------- Form validation schema -------------------------------------------------------------------

const validationSchema = Yup.object().shape({
  ispPassportAddress: Yup.string()
    .required(translate(t => t.errors.required)),
  speed: Yup.number()
    .typeError(translate(t => t.errors.mustBeNumber))
    .required(translate(t => t.errors.required))
    .positive(translate(t => t.errors.mustBePositiveNumber)),
});

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class ContractForm extends React.PureComponent<ICombinedProps> {
  private initialValues: IFormValues;
  private showErrorsSince = new Date();

  public constructor(props) {
    super(props);

    this.initialValues = {
      ispPassportAddress: '',
      speed: '',
    };
  }

  public componentDidMount() {
    this.props.loadISPs();
  }

  public render() {
    const { creationStatus } = this.props;
    const isLoading = creationStatus && creationStatus.isFetching;

    return (
      <div className='mh-contract-form'>
        {isLoading && (
          <Loader
            fullArea={true}
            message={translate(t => t.common.txExecutionInProgress)}
          />
        )}

        {this.renderError()}

        <Formik<IFormValues>
          initialValues={this.initialValues}
          onSubmit={this.props.createContract}
          validationSchema={validationSchema}
          validateOnChange
        >
          {this.renderForm}
        </Formik>
      </div>
    );
  }

  private renderForm = ({ handleChange, values }) => {
    const { creationStatus } = this.props;
    const disabled = creationStatus && creationStatus.isFetching;

    return (
      <Form>
        <FormikField
          name='ispPassportAddress'
        >
          <DropdownInput
            name='ispPassportAddress'
            onChange={handleChange}
            value={values.ispPassportAddress}
            placeholder='ISP'
            disabled={disabled}
            items={this.getISPOptions(values.ispPassportAddress)}
          />

        </FormikField>

        <FormikField
          name='speed'
        >
          <TextInput
            name='speed'
            onChange={handleChange}
            value={values.speed}
            disabled={disabled}
            placeholder={`${translate(t => t.contract.ensuredSpeed)} Mbps`}
          />
        </FormikField>

        <Button
          type='submit'
          disabled={disabled}
        >
          {translate(t => t.common.submit)}
        </Button>
      </Form>
    );
  }

  private renderError() {
    const { creationStatus } = this.props;
    if (!creationStatus || creationStatus.isFetching || !creationStatus.error) {
      return null;
    }

    if (creationStatus.errorTimestamp < this.showErrorsSince) {
      return null;
    }

    return (
      <Alert type={AlertType.Error}>
        {creationStatus.error.friendlyMessage}
      </Alert>
    );
  }

  private getISPOptions = (currentIspValue: string): React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>[] => {
    const { isps } = this.props;

    const options: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>[] = [];

    if (!currentIspValue) {
      options.push({
        value: '',
        children: translate(t => t.contract.selectIsp),
      });
    }

    const usedAddresses = new Set<Address>();

    forEach(isps, isp => {
      if (!isp || !isp.data || usedAddresses.has(isp.data.address)) {
        return;
      }

      usedAddresses.add(isp.data.address);

      options.push({
        value: isp.data.passportAddress,
        children: isp.data.name,
      });
    });

    return options;
  }
}

// #endregion

// #region -------------- Connect -------------------------------------------------------------------

const connected = connect<IStateProps, IDispatchProps, IProps, IState>(
  (state, ownProps) => {
    const creationStatus = state.contract.creationStatus[ownProps.school.address];
    const isps = state.isp.loaded;

    return {
      creationStatus,
      isps,
    };
  },
  (dispatch, ownProps) => {
    return {
      loadISPs: () => {
        dispatch(loadISPs.init(null, {
          cacheTimeout: -1,
        }));
      },
      createContract: (values: IFormValues) => {
        dispatch(createContract.init({
          schoolAddress: ownProps.school.address,
          ispPassportAddress: values.ispPassportAddress,
          speed: Number(values.speed),
        }));
      },
    };
  },
)(ContractForm);

export { connected as ContractForm };

// #endregion
