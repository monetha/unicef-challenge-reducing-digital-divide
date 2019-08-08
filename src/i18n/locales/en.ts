import { Country } from 'src/constants/countries';

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
    transactionDenied: 'Transaction was denied',
  },
  common: {
    submit: 'Submit',
    load: 'Load',
    view: 'View',
    download: 'Download',
    noData: 'No data',
    date: 'Date',
    txExecutionInProgress: 'Transaction executing in your wallet provider. \nPlease confirm it.',
    success: 'Success',
  },
  nav: {
    overview: 'Overview',
    createSchool: 'Create school',
    createISP: 'Create ISP',
  },
  footer: {
    copyright: 'Powered by Monetha Platform © 2019 Monetha',
  },
  pages: {
    overview: {
      title: 'Connectivity overview',
    },
  },
  form: {
  },
  ethereum: {
    ropsten: 'Ropsten',
    mainnet: 'Mainnet',
    customUrl: 'Custom url',
  },
  school: {
    address: 'School address',
    createContract: 'Create contract',
    noContract: 'School has no contract with any ISP',
    contractWith: 'Contract with',
    minSpeed: 'Ensured minimum speed',
    contractComplience: 'Compliance with the contract',
    creating: 'Adding school...',
    success: 'School has been successfully added',
    enterName: 'Enter name...',
    enterPhysicalAddress: 'Enter physical address...',
  },
  contract: {
    ispReport: 'ISP report',
    schoolReport: 'School report',
    contractSpeed: 'Contract speed',
    complience: 'Complience',
    reportSpeed: 'Report speed',
    ensuredSpeed: 'Ensured speed',
    factualSpeed: 'Factual speed',
    speedOverTime: 'Speed over time',
    speedReportHistory: 'Speed report history',
    selectIsp: 'Select ISP...',
    calculateSpeed: 'Calculate speed with https://fast.com',
  },
  isp: {
    address: 'ISP address',
    passport: 'ISP digital identity',
    identityCreated: 'Identity created',
    success: 'ISP has been successfully added:',
    enterName: 'Enter name...',
    creatingPassport: 'Step 1 of 3. Creating identity. \nPlease confirm and close Metamask window...',
    claimingOwnership: 'Step 2 of 3. Claiming ownership of the identity. \nPlease confirm Metamask window...',
    submittingMetadata: 'Step 3 of 3. Submitting metadata to identity. \nPlease confirm Metamask window...',
  },
  countries: {
    [Country.AFG]: 'Afghanistan',
    [Country.ALA]: 'Åland Islands',
    [Country.ALB]: 'Albania',
    [Country.DZA]: 'Algeria',
    [Country.ASM]: 'American Samoa',
    [Country.AND]: 'Andorra',
    [Country.AGO]: 'Angola',
    [Country.AIA]: 'Anguilla',
    [Country.ATA]: 'Antarctica',
    [Country.ATG]: 'Antigua and Barbuda',
    [Country.ARG]: 'Argentina',
    [Country.ARM]: 'Armenia',
    [Country.ABW]: 'Aruba',
    [Country.AUS]: 'Australia',
    [Country.AUT]: 'Austria',
    [Country.AZE]: 'Azerbaijan',
    [Country.BHS]: 'Bahamas',
    [Country.BHR]: 'Bahrain',
    [Country.BGD]: 'Bangladesh',
    [Country.BRB]: 'Barbados',
    [Country.BLR]: 'Belarus',
    [Country.BEL]: 'Belgium',
    [Country.BLZ]: 'Belize',
    [Country.BEN]: 'Benin',
    [Country.BMU]: 'Bermuda',
    [Country.BTN]: 'Bhutan',
    [Country.BOL]: 'Bolivia (Plurinational State of)',
    [Country.BES]: 'Bonaire, Sint Eustatius and Saba',
    [Country.BIH]: 'Bosnia and Herzegovina',
    [Country.BWA]: 'Botswana',
    [Country.BVT]: 'Bouvet Island',
    [Country.BRA]: 'Brazil',
    [Country.IOT]: 'British Indian Ocean Territory',
    [Country.BRN]: 'Brunei Darussalam',
    [Country.BGR]: 'Bulgaria',
    [Country.BFA]: 'Burkina Faso',
    [Country.BDI]: 'Burundi',
    [Country.CPV]: 'Cabo Verde',
    [Country.KHM]: 'Cambodia',
    [Country.CMR]: 'Cameroon',
    [Country.CAN]: 'Canada',
    [Country.CYM]: 'Cayman Islands',
    [Country.CAF]: 'Central African Republic',
    [Country.TCD]: 'Chad',
    [Country.CHL]: 'Chile',
    [Country.CHN]: 'China',
    [Country.CXR]: 'Christmas Island',
    [Country.CCK]: 'Cocos (Keeling) Islands',
    [Country.COL]: 'Colombia',
    [Country.COM]: 'Comoros',
    [Country.COG]: 'Congo',
    [Country.COD]: 'Congo, Democratic Republic of the',
    [Country.COK]: 'Cook Islands',
    [Country.CRI]: 'Costa Rica',
    [Country.CIV]: 'Côte d\'Ivoire',
    [Country.HRV]: 'Croatia',
    [Country.CUB]: 'Cuba',
    [Country.CUW]: 'Curaçao',
    [Country.CYP]: 'Cyprus',
    [Country.CZE]: 'Czechia',
    [Country.DNK]: 'Denmark',
    [Country.DJI]: 'Djibouti',
    [Country.DMA]: 'Dominica',
    [Country.DOM]: 'Dominican Republic',
    [Country.ECU]: 'Ecuador',
    [Country.EGY]: 'Egypt',
    [Country.SLV]: 'El Salvador',
    [Country.GNQ]: 'Equatorial Guinea',
    [Country.ERI]: 'Eritrea',
    [Country.EST]: 'Estonia',
    [Country.SWZ]: 'Eswatini',
    [Country.ETH]: 'Ethiopia',
    [Country.FLK]: 'Falkland Islands (Malvinas)',
    [Country.FRO]: 'Faroe Islands',
    [Country.FJI]: 'Fiji',
    [Country.FIN]: 'Finland',
    [Country.FRA]: 'France',
    [Country.GUF]: 'French Guiana',
    [Country.PYF]: 'French Polynesia',
    [Country.ATF]: 'French Southern Territories',
    [Country.GAB]: 'Gabon',
    [Country.GMB]: 'Gambia',
    [Country.GEO]: 'Georgia',
    [Country.DEU]: 'Germany',
    [Country.GHA]: 'Ghana',
    [Country.GIB]: 'Gibraltar',
    [Country.GRC]: 'Greece',
    [Country.GRL]: 'Greenland',
    [Country.GRD]: 'Grenada',
    [Country.GLP]: 'Guadeloupe',
    [Country.GUM]: 'Guam',
    [Country.GTM]: 'Guatemala',
    [Country.GGY]: 'Guernsey',
    [Country.GIN]: 'Guinea',
    [Country.GNB]: 'Guinea-Bissau',
    [Country.GUY]: 'Guyana',
    [Country.HTI]: 'Haiti',
    [Country.HMD]: 'Heard Island and McDonald Islands',
    [Country.VAT]: 'Holy See',
    [Country.HND]: 'Honduras',
    [Country.HKG]: 'Hong Kong',
    [Country.HUN]: 'Hungary',
    [Country.ISL]: 'Iceland',
    [Country.IND]: 'India',
    [Country.IDN]: 'Indonesia',
    [Country.IRN]: 'Iran (Islamic Republic of)',
    [Country.IRQ]: 'Iraq',
    [Country.IRL]: 'Ireland',
    [Country.IMN]: 'Isle of Man',
    [Country.ISR]: 'Israel',
    [Country.ITA]: 'Italy',
    [Country.JAM]: 'Jamaica',
    [Country.JPN]: 'Japan',
    [Country.JEY]: 'Jersey',
    [Country.JOR]: 'Jordan',
    [Country.KAZ]: 'Kazakhstan',
    [Country.KEN]: 'Kenya',
    [Country.KIR]: 'Kiribati',
    [Country.PRK]: 'Korea (Democratic People\'s Republic of)',
    [Country.KOR]: 'Korea, Republic of',
    [Country.KWT]: 'Kuwait',
    [Country.KGZ]: 'Kyrgyzstan',
    [Country.LAO]: 'Lao People\'s Democratic Republic',
    [Country.LVA]: 'Latvia',
    [Country.LBN]: 'Lebanon',
    [Country.LSO]: 'Lesotho',
    [Country.LBR]: 'Liberia',
    [Country.LBY]: 'Libya',
    [Country.LIE]: 'Liechtenstein',
    [Country.LTU]: 'Lithuania',
    [Country.LUX]: 'Luxembourg',
    [Country.MAC]: 'Macao',
    [Country.MDG]: 'Madagascar',
    [Country.MWI]: 'Malawi',
    [Country.MYS]: 'Malaysia',
    [Country.MDV]: 'Maldives',
    [Country.MLI]: 'Mali',
    [Country.MLT]: 'Malta',
    [Country.MHL]: 'Marshall Islands',
    [Country.MTQ]: 'Martinique',
    [Country.MRT]: 'Mauritania',
    [Country.MUS]: 'Mauritius',
    [Country.MYT]: 'Mayotte',
    [Country.MEX]: 'Mexico',
    [Country.FSM]: 'Micronesia (Federated States of)',
    [Country.MDA]: 'Moldova, Republic of',
    [Country.MCO]: 'Monaco',
    [Country.MNG]: 'Mongolia',
    [Country.MNE]: 'Montenegro',
    [Country.MSR]: 'Montserrat',
    [Country.MAR]: 'Morocco',
    [Country.MOZ]: 'Mozambique',
    [Country.MMR]: 'Myanmar',
    [Country.NAM]: 'Namibia',
    [Country.NRU]: 'Nauru',
    [Country.NPL]: 'Nepal',
    [Country.NLD]: 'Netherlands',
    [Country.NCL]: 'New Caledonia',
    [Country.NZL]: 'New Zealand',
    [Country.NIC]: 'Nicaragua',
    [Country.NER]: 'Niger',
    [Country.NGA]: 'Nigeria',
    [Country.NIU]: 'Niue',
    [Country.NFK]: 'Norfolk Island',
    [Country.MKD]: 'North Macedonia',
    [Country.MNP]: 'Northern Mariana Islands',
    [Country.NOR]: 'Norway',
    [Country.OMN]: 'Oman',
    [Country.PAK]: 'Pakistan',
    [Country.PLW]: 'Palau',
    [Country.PSE]: 'Palestine, State of',
    [Country.PAN]: 'Panama',
    [Country.PNG]: 'Papua New Guinea',
    [Country.PRY]: 'Paraguay',
    [Country.PER]: 'Peru',
    [Country.PHL]: 'Philippines',
    [Country.PCN]: 'Pitcairn',
    [Country.POL]: 'Poland',
    [Country.PRT]: 'Portugal',
    [Country.PRI]: 'Puerto Rico',
    [Country.QAT]: 'Qatar',
    [Country.REU]: 'Réunion',
    [Country.ROU]: 'Romania',
    [Country.RUS]: 'Russian Federation',
    [Country.RWA]: 'Rwanda',
    [Country.BLM]: 'Saint Barthélemy',
    [Country.SHN]: 'Saint Helena, Ascension and Tristan da Cunha',
    [Country.KNA]: 'Saint Kitts and Nevis',
    [Country.LCA]: 'Saint Lucia',
    [Country.MAF]: 'Saint Martin (French part)',
    [Country.SPM]: 'Saint Pierre and Miquelon',
    [Country.VCT]: 'Saint Vincent and the Grenadines',
    [Country.WSM]: 'Samoa',
    [Country.SMR]: 'San Marino',
    [Country.STP]: 'Sao Tome and Principe',
    [Country.SAU]: 'Saudi Arabia',
    [Country.SEN]: 'Senegal',
    [Country.SRB]: 'Serbia',
    [Country.SYC]: 'Seychelles',
    [Country.SLE]: 'Sierra Leone',
    [Country.SGP]: 'Singapore',
    [Country.SXM]: 'Sint Maarten (Dutch part)',
    [Country.SVK]: 'Slovakia',
    [Country.SVN]: 'Slovenia',
    [Country.SLB]: 'Solomon Islands',
    [Country.SOM]: 'Somalia',
    [Country.ZAF]: 'South Africa',
    [Country.SGS]: 'South Georgia and the South Sandwich Islands',
    [Country.SSD]: 'South Sudan',
    [Country.ESP]: 'Spain',
    [Country.LKA]: 'Sri Lanka',
    [Country.SDN]: 'Sudan',
    [Country.SUR]: 'Suriname',
    [Country.SJM]: 'Svalbard and Jan Mayen',
    [Country.SWE]: 'Sweden',
    [Country.CHE]: 'Switzerland',
    [Country.SYR]: 'Syrian Arab Republic',
    [Country.TWN]: 'Taiwan, Province of China',
    [Country.TJK]: 'Tajikistan',
    [Country.TZA]: 'Tanzania, United Republic of',
    [Country.THA]: 'Thailand',
    [Country.TLS]: 'Timor-Leste',
    [Country.TGO]: 'Togo',
    [Country.TKL]: 'Tokelau',
    [Country.TON]: 'Tonga',
    [Country.TTO]: 'Trinidad and Tobago',
    [Country.TUN]: 'Tunisia',
    [Country.TUR]: 'Turkey',
    [Country.TKM]: 'Turkmenistan',
    [Country.TCA]: 'Turks and Caicos Islands',
    [Country.TUV]: 'Tuvalu',
    [Country.UGA]: 'Uganda',
    [Country.UKR]: 'Ukraine',
    [Country.ARE]: 'United Arab Emirates',
    [Country.GBR]: 'United Kingdom of Great Britain and Northern Ireland',
    [Country.USA]: 'United States of America',
    [Country.UMI]: 'United States Minor Outlying Islands',
    [Country.URY]: 'Uruguay',
    [Country.UZB]: 'Uzbekistan',
    [Country.VUT]: 'Vanuatu',
    [Country.VEN]: 'Venezuela (Bolivarian Republic of)',
    [Country.VNM]: 'Viet Nam',
    [Country.VGB]: 'Virgin Islands (British)',
    [Country.VIR]: 'Virgin Islands (U.S.)',
    [Country.WLF]: 'Wallis and Futuna',
    [Country.ESH]: 'Western Sahara',
    [Country.YEM]: 'Yemen',
    [Country.ZMB]: 'Zambia',
    [Country.ZWE]: 'Zimbabwe',
  },
});

export default translations;

  // tslint:enable:max-line-length
