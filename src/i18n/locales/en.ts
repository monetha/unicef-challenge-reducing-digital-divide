// tslint:disable:max-line-length

interface ITranslation {
  [key: string]: string | ITranslation;
}

/**
 * Validate at compile-time whether given translation tree has valid structure
 */
const validateBaseTranslations = <T extends ITranslation>(tree: T) => {
  return tree;
};

const translations = validateBaseTranslations({
  errors: {
    somethingUnexpectedHasHappended: 'Something unexpected has happened',
    connectivityProblems: 'There are some connectivity problems',
    timeout: 'The operation has timed out. \nPlease check your internet connection',
    mustBeNCharsLengths: 'Must be {{length}} characters long',
    required: 'Required',
    mustBeNumber: 'Must be a number',
    containsInvalidChars: 'Contains invalid characters',
    invalidAddress: 'Address is invalid',
    mustBePositiveNumber: 'Must be a positive number',
    mustBeWholeNumber: 'Must be a whole number',
    tooManyResults: 'Too many results',
  },
  common: {
    submit: 'Submit',
    load: 'Load',
    view: 'View',
    download: 'Download',
    noData: 'No data',
  },
  nav: {
  },
  footer: {
    copyright: '© 2019 Monetha. All rights reserved.',
  },
  form: {
  },
  ethereum: {
    ropsten: 'Ropsten',
    mainnet: 'Mainnet',
    customUrl: 'Custom url',
  },
});

export default translations;

  // tslint:enable:max-line-length
