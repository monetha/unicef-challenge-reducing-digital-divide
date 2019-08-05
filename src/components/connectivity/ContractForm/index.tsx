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
  ispAddress: Address;
  speed: string;
}

// #endregion

// #region -------------- Form validation schema -------------------------------------------------------------------

const validationSchema = Yup.object().shape({
  ispAddress: Yup.string()
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

  public constructor(props) {
    super(props);

    this.initialValues = {
      ispAddress: '',
      speed: '',
    };
  }

  public componentDidMount() {
    this.props.loadISPs();
  }

  public render() {
    return (
      <div className='mh-contract-form'>
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
          name='ispAddress'
        >
          <DropdownInput
            name='ispAddress'
            onChange={handleChange}
            value={values.ispAddress}
            placeholder='ISP'
            disabled={disabled}
            items={this.getISPOptions()}
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

        <Button type='submit'>
          {translate(t => t.common.submit)}
        </Button>
      </Form>
    );
  }

  private getISPOptions = (): React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>[] => {
    const { isps } = this.props;

    const options: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>[] = [];

    const usedAddresses = new Set<Address>();

    forEach(isps, isp => {
      if (!isp || !isp.data || usedAddresses.has(isp.data.address)) {
        return;
      }

      usedAddresses.add(isp.data.address);

      options.push({
        value: isp.data.address,
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
          ispAddress: values.ispAddress,
          speed: Number(values.speed),
        }));
      },
    };
  },
)(ContractForm);

export { connected as ContractForm };

// #endregion
