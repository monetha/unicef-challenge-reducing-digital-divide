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

// #region -------------- Interfaces --------------------------------------------------------------

interface IStateProps {
  name: string;
}

interface IDispatchProps {
  onSubmit(values: IStateProps);
}

interface IProps extends RouteComponentProps<any>, IDispatchProps {
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

class CreateISPPage extends React.Component<IProps, IStateProps> {
  public readonly state: Readonly<IStateProps> = {
    name: '',
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
        <Button
          type='submit'
        >
          {translate(t => t.nav.createISP)}
        </Button>
      </Form>
    );
  }

  public render() {
    return (
      <MainTemplate className='mh-create-isp-page'>
        <Content size={Size.Md}>
          <FormWrapper header={translate(t => t.nav.createISP)}>
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
    };
  },
  dispatch => {
    return {
      onSubmit(values: IStateProps) {
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
