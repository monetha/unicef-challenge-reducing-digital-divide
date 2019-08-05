import React from 'react';
import classnames from 'classnames';
import './style.scss';
import { PageTitle } from 'src/components/text/PageTitle';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps extends React.HTMLProps<HTMLHeadingElement> {
  header: string;
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export class FormWrapper extends React.PureComponent<IProps> {
  public render() {
    const { children, className, header, ...rest } = this.props;

    return (
      <div
        {...rest}
        className={classnames('mh-form-wrapper', className)}
      >
        <PageTitle>{header}</PageTitle>
        {children}
      </div>
    );
  }
}

// #endregion
