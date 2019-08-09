import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Content, Size } from 'src/components/layout/Content';
import { MainTemplate } from 'src/components/layout/MainTemplate';
import { IState } from 'src/state/rootReducer';
import './style.scss';
import { FormWrapper } from 'src/components/text/FormWrapper';
import { translate } from 'src/i18n';
import { Form, Formik } from 'formik';
import { TextInput } from 'src/components/form/TextInput';
import { Button } from 'src/components/form/Button';
import { DropdownInput } from 'src/components/form/DropdownInput';
import { Country } from 'src/constants/countries';
import { createSchool } from 'src/state/school/action';
import { AsyncState, IAsyncState } from 'core/redux/asyncAction';
import * as Yup from 'yup';
import { FormikField } from 'src/components/form/FormikField';
import { Loader } from 'src/components/indicators/Loader';
import { Alert, AlertType } from 'src/components/indicators/Alert';
import { Description } from 'src/components/text/Description';
import { getPassportScannerUrl } from 'src/utils/address';
import { unicefPassportAddress } from 'src/constants/addresses';

// #region -------------- Interfaces --------------------------------------------------------------

interface IDispatchProps {
  onSubmit(values: IFormValues);
}

interface IStateProps {
  status: IAsyncState<void>;
}

interface ICombinedProps extends RouteComponentProps<any>, IDispatchProps, IStateProps {
  status: AsyncState<void>;
}

const getCountriesDropdown = (): React.OptionHTMLAttributes<HTMLOptionElement>[] => {
  return Object.keys(Country).map(item => ({
    children: translate(t => t.countries[item]),
    value: item,
  }));
};

interface IFormValues {
  name: string;
  physicalAddress: string;
  country?: Country;
}

// #endregion

// #region -------------- Form validation schema -------------------------------------------------------------------

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required(translate(t => t.errors.required)),
  physicalAddress: Yup.string()
    .required(translate(t => t.errors.required)),
  country: Yup.string()
    .required(translate(t => t.errors.required)),
});

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class CreateSchoolPage extends React.Component<ICombinedProps> {
  private readonly countriesDropdown: React.OptionHTMLAttributes<HTMLOptionElement>[];

  private initialValues: IFormValues = {
    name: '',
    physicalAddress: '',
    country: Country.USA,
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

  public constructor(props) {
    super(props);

    this.countriesDropdown = getCountriesDropdown();
  }

  public render() {
    return (
      <MainTemplate className='mh-create-school-page'>
        <Content size={Size.Md}>
          <Description>
            {translate(t => t.pages.createSchool.description)} at <a href={getPassportScannerUrl(unicefPassportAddress)} target='_blank'>{unicefPassportAddress}</a>
          </Description>

          <FormWrapper header={translate(t => t.nav.createSchool)}>
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
            placeholder={translate(t => t.school.enterName)}
            disabled={disabled}
          />
        </FormikField>

        <FormikField
          name='physicalAddress'
        >
          <TextInput
            name='physicalAddress'
            onChange={handleChange}
            value={values.physicalAddress}
            placeholder={translate(t => t.school.enterPhysicalAddress)}
            disabled={disabled}
          />
        </FormikField>

        <FormikField
          name='country'
        >
          <DropdownInput
            name='country'
            items={this.countriesDropdown}
            onChange={handleChange}
            value={values.country}
            disabled={disabled}
          />
        </FormikField>

        <div className='mh-button-wrapper'>
          <Button
            type='submit'
            disabled={disabled}
          >
            {translate(t => t.nav.createSchool)}
          </Button>
        </div>
      </Form>
    );
  }

  private renderLoader() {
    const { status } = this.props;
    const isLoading = status && status.isFetching;

    if (!isLoading) {
      return null;
    }

    return (
      <Loader
        fullArea={true}
        message={translate(t => t.common.txExecutionInProgress)}
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
    const { status } = this.props;
    if (!status || status.isFetching || !status.isFetched || status.error) {
      return null;
    }

    if (status.timestamp < this.showAlertsSince) {
      return null;
    }

    return (
      <Alert type={AlertType.Success}>
        {translate(t => t.common.success)}
      </Alert>
    );
  }
}

// #endregion

// #region -------------- Connect -------------------------------------------------------------------

const connected = connect<IStateProps, IDispatchProps, RouteComponentProps<any>, IState>(
  (state: IState) => {
    return {
      status: state.school.creationStatus,
    };
  },
  dispatch => {
    return {
      onSubmit(values: IFormValues) {
        dispatch(createSchool.init({
          name: values.name,
          physicalAddress: values.physicalAddress,
          country: values.country,
          score: 0.7,
        }));
      },
    };
  },
)(CreateSchoolPage);

export { connected as CreateSchoolPage };

// #endregion
