import React from 'react';
import { connect, getIn, ErrorMessage } from 'formik';
import classnames from 'classnames';
import { Label } from 'src/components/text/Label';
import './style.scss';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps {
  name: string;
  label?: string;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export const FormikField = connect<IProps>(((props) => {
  const { label, name, children } = props;
  const { errors, touched } = props.formik;

  const error = getIn(errors, name);
  const touch = getIn(touched, name);

  const withError = touch && error;

  return (
    <div className={classnames('mh-formik-field', {
      'mh-with-error': withError,
    })}>
      {label && (
        <Label>{label}</Label>
      )}

      {children}

      <ErrorMessage
        className='mh-error-msg'
        name={name}
        component='div'
      />
    </div>
  );
}));

// #endregion
