# UNICEF Challenge: Reducing The Digital Divide

This project is prepared for a Unicef initiated bounty on Gitcoin.co to [Reduce Digital Divide](https://gitcoin.co/issue/gitcoinco/skunkworks/127/3308)

The purpose is to develop a way to transparently connect and manage school connectivity around the world, creating a reality where young people have access to opportunity but also to create value for themselves in their communities. We envision this system having several parts to it, including:

1. **Application to enable governments, the public, and connectivity/network providers to view connectivity for a specific country;** ISP, donors and the general public can leverage data from this dashboard to view the connectivity for each country. When ledgers are public and the accounting is being done for the system in a straightforward manner, it will then be clear when and where there is an ability to meet service contracts.

2. **Application to hold all parties accountable;** Mobile network operators, and other service providers will have connectivity data in the public domain, while investors, funders and users will be able to track and understand connectivity better. Smart contracts can adjudicate contractual status in realtime (i.e. if a provider isn't providing…the contract can automatically move to a next vendor etc.)

## Assumptions for the project

Web app is used in autonomous way by network participants: ISP, Schools, General public.

- ISPs creates a digital identity that is used for their identification.
- ISP provides metadata about their digital identity: Company name.
- Schools register their agreements with current ISP.
- ISP (including Mobile network operators) need to declare their internet speed per School on daily basis
- School needs to provide their internet speed on daily basis
- Dashboard must show an overview of internet connectivity per Country
- All data must be stored on a public ledger or IPFS
- Both ISP and School know how to use Metamask extension to handle Ethereum wallets and sign/submit transactions

## Design

A design for data sharing between ISPs and Schools is driven by capabilities of [verifiable data layer]() capabilities of Monetha Platform. Where digital identities collect information from multiple data sources for further usage.

Actors:

- Unicef
- ISP
- School

### Unicef

A digital identity that contains a registry of all Schools

### ISP

An ethereum account that creates a [digital identity](https://github.com/monetha/reputation-contracts#passport) to identify himself as ISP. This account provides meta data about himself e.g. "company name". This digital identity is becoming a data collection point for further interaction with Schools.

### School

An ethereum account that is providing data to an ISP and Unicef. School registers itself with Unicef digital identity. Schools provides data about Agreement with ISP into ISP's digital identity.

## Usage

### Registering an ISP

1. Enter unique ISP name.

![alt text](https://raw.githubusercontent.com/monetha/unicef-challenge-reducing-digital-divide/master/img/isp_1.jpg)

2. Confirm transaction and close metamask

![alt text](https://raw.githubusercontent.com/monetha/unicef-challenge-reducing-digital-divide/master/img/isp_2.jpg)

3. New metamask window will popup to claim identity ownership

![alt text](https://raw.githubusercontent.com/monetha/unicef-challenge-reducing-digital-divide/master/img/isp_3.jpg)

4. The last step is to submit metadata

![alt text](https://raw.githubusercontent.com/monetha/unicef-challenge-reducing-digital-divide/master/img/isp_4.jpg)

5. ISP successfully registered

![alt text](https://raw.githubusercontent.com/monetha/unicef-challenge-reducing-digital-divide/master/img/isp_5.jpg)

### Registering a School

1. Enter school name, select country and enter school physical address.

![alt text](https://raw.githubusercontent.com/monetha/unicef-challenge-reducing-digital-divide/master/img/school_1.jpg)

### Registering an agreement between School and ISP

1. Select ISP from the list and provide internet speed value from legal agreement. Note: Agreement can be registered only from scool address.

![alt text](https://raw.githubusercontent.com/monetha/unicef-challenge-reducing-digital-divide/master/img/agreement_1.jpg)

### Internet speed provisioning

1. Select school from list and press `Report speed` button.

![alt text](https://raw.githubusercontent.com/monetha/unicef-challenge-reducing-digital-divide/master/img/report_speed_1.jpg)

2. Provide internet speed information and submit transaction in metamask. Note: internet speed can be provisioned only from school or ISP address.

![alt text](https://raw.githubusercontent.com/monetha/unicef-challenge-reducing-digital-divide/master/img/report_speed_2.jpg)

3. See provided details in reported dashboard

![alt text](https://raw.githubusercontent.com/monetha/unicef-challenge-reducing-digital-divide/master/img/report_speed_3.jpg)


## Setup and installation

Install all dependencies

```sh
npm install
```

Start a development server with the following command

```sh
npm start
```

App will be running at [http://localhost:3000](http://localhost:3000) and use Ropsten testnet for MVP purpose. **Note** make sure to set Metamask for Ropsten testnet

### Bootstrapping new environment

## Improvements

- Add more metadata for Schools in order to be able to use data on maps as per [http://school-mapping.azurewebsites.net/](http://school-mapping.azurewebsites.net/) project.
- Add signed agreements contracts to ISP digital identity and store them securely as per Monetha platform documentation of [private data storage](https://github.com/monetha/js-verifiable-data#Private-data) with a possibility to expose data via [private data exchange](https://github.com/monetha/js-verifiable-data#Private-data-exchange).
- Automate speed registration via scheduled job running on School's or ISP machine. It can be prepared leveraging Monetha Platform SDKs either [Nodejs](github.com/monetha/js-verifiable-data) or [Golang](https://github.com/monetha/go-verifiable-data)
- Improve usability by allowing to use other crypto wallets: MEW, Opera Wallet, Metamask Mobile Wallet.
- Schools can as well create digital identities for participation in other Unicef projects.
