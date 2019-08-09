import React from 'react';
import './style.scss';
import classnames from 'classnames';

// #region -------------- Interfaces --------------------------------------------------------------

export interface IProps extends React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  items: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>[];
}

// #endregion

// #region -------------- Component ---------------------------------------------------------------

export class DropdownInput extends React.PureComponent<IProps> {

  public render() {
    const { className, items, ...rest } = this.props;

    return (
      <select
        className={classnames('mh-dropdown-input', className)}
        {...rest}
      >
        {items.map(i => (
          <option
            key={!i.value ? '' : i.value.toString()}
            {...i}
          >
            {i.label || ''}
          </option>
        ))}
      </select>
    );
  }
}

// #endregion
