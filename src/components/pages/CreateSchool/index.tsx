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
import { CreateSchoolStatuses, ICreateSchoolStatus } from 'src/state/school/reducer';

// #region -------------- Interfaces --------------------------------------------------------------

interface IDispatchProps {
  onSubmit(values: IInitialValues);
}

interface IStateProps {
  status: IAsyncState<ICreateSchoolStatus>;
}

interface IProps extends RouteComponentProps<any>, IDispatchProps, IStateProps {
  status: AsyncState<ICreateSchoolStatus>;
}

const getCountriesDropdown = (): React.OptionHTMLAttributes<HTMLOptionElement>[] => {
  return Object.keys(Country).map(item => ({
    label: translate(t => t.countries[item]),
    value: item,
  }));
};

interface IInitialValues {
  name: string;
  physicalAddress: string;
  country?: Country;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class CreateSchoolPage extends React.Component<IProps> {
  private readonly countriesDropdown: React.OptionHTMLAttributes<HTMLOptionElement>[];

  private initialValues: IInitialValues = {
    name: '',
    physicalAddress: '',
    country: Country.USA,
  };

  public constructor(props) {
    super(props);

    this.countriesDropdown = getCountriesDropdown();
  }

  private renderForm = ({ handleChange, values }) => {
    const { status } = this.props;
    let statusText = '';
    let statusId: CreateSchoolStatuses;
    if (status.isFetched && status.data[values.name] !== undefined && status.data[values.name].status) {
      statusId = status.data[values.name].status;
      statusText = getStatusText(statusId);
    }
    const disabled = statusId === CreateSchoolStatuses.CreatingSchool;

    return (
      <Form>
        <h1>{statusText}</h1>
        <TextInput
          name='name'
          onChange={handleChange}
          value={values.name}
          placeholder=''
        />
        <TextInput
          name='physicalAddress'
          onChange={handleChange}
          value={values.address}
          placeholder=''
        />
        <DropdownInput
          name='country'
          items={this.countriesDropdown}
          onChange={handleChange}
          value={values.country}
        />
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

  public render() {
    return (
      <MainTemplate className='mh-create-school-page'>
        <Content size={Size.Md}>
          <FormWrapper header={translate(t => t.nav.createSchool)}>
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

const getStatusText = (status: CreateSchoolStatuses): string => {
  if (!status) {
    return '';
  }

  if (status === CreateSchoolStatuses.SchoolCreated) {
    return translate(t => t.school.success);
  }

  return translate(t => t.school.creating);
};

// #region -------------- Connect -------------------------------------------------------------------

const connected = connect<IStateProps, IDispatchProps, RouteComponentProps<any>, IState>(
  (state: IState) => {
    return {
      status: state.school.status,
    };
  },
  dispatch => {
    return {
      onSubmit(values: IInitialValues) {
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
