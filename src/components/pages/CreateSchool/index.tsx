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

// #region -------------- Interfaces --------------------------------------------------------------

interface IStateProps {
  name: string;
  address: string;
  country?: Country;
}

interface IDispatchProps {
  onSubmit(values: IStateProps);
}

interface IProps extends RouteComponentProps<any>, IDispatchProps {
  countries: React.OptionHTMLAttributes<HTMLOptionElement>[];
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class CreateSchoolPage extends React.Component<IProps, IStateProps> {
  public readonly state: Readonly<IStateProps> = {
    name: '',
    address: '',
    country: Country.USA,
  };

  private renderForm = ({ handleChange, values }) => {
    return (
      <Form>
        <TextInput
          name='name'
          onChange={handleChange}
          value={values.name}
          placeholder=''
        />
        <TextInput
          name='address'
          onChange={handleChange}
          value={values.address}
          placeholder=''
        />
        <DropdownInput
          name='country'
          items={this.props.countries}
          onChange={handleChange}
          value={values.country}
        />
        <Button
          type='submit'
        >
          {translate(t => t.nav.createSchool)}
        </Button>
      </Form>
    );
  }

  public render() {
    return (
      <MainTemplate className='mh-create-school-page'>
        <Content size={Size.Md}>
          <FormWrapper header={translate(t => t.nav.createSchool)}>
            <Formik<IStateProps>
              initialValues={this.state}
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

// #region -------------- Connect -------------------------------------------------------------------

const connected = connect<IStateProps, IDispatchProps, RouteComponentProps<any>, IState>(
  () => {
    return {
      countries: Object.keys(Country).map(item => ({
        label: item,
        value: item,
      })),
    };
  },
  () => {
    return {
      onSubmit(values: IStateProps) {
        console.log(values);
        // dispatch(getPassportInformation.init({
        //   passportAddress: values.passportAddress,
        // }));
      },
    };
  },
)(CreateSchoolPage);

export { connected as CreateSchoolPage };

// #endregion
