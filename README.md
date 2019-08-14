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

A design for data sharing between ISPs and Schools is driven by capabilities of [verifiable data layer](https://github.com/monetha/reputation-layer) capabilities of Monetha Platform. Where digital identities collect information from multiple data sources for further usage.

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

A guide on what operations are available and how to use them can be found [GUIDE.md](GUIDE.md)

## Setup and installation

Install all dependencies

```sh
npm install
```

Start a development server with the following command

```sh
npm start
```

App will be running at [http://localhost:3000](http://localhost:3000) and use Ropsten testnet for MVP purpose. **Note** make sure to set Metamask for Ropsten testnet.

To get Ethereum on Ropsten please use [this faucet](https://faucet.ropsten.be)

### Bootstrapping new environment

Environment could be setup on any Ethereum compatible blockchain (Mainnet, Ropsten, Quorum, Pantheon, etc.).

App requires a set of smart contracts to be pre-deployed:

- `PassportLogic` - A contract which specifies upgradeable execution logic for digital identities (read more [here](https://github.com/monetha/reputation-contracts#passport-logic))
- `PassportLogicRegistry` - A contract which allows execution logic versioning and assignment for digital identities (read more [here](https://github.com/monetha/reputation-contracts#facts-provider-registry))
- `PassportFactory` - A contract which allows creating new digital identities for ISPs and holds a list of them (read more [here](https://github.com/monetha/reputation-contracts#passport-factory))
- `Passport` - The digital identity for UNICEF. This identity will hold all registered schools (read more [here](https://github.com/monetha/reputation-contracts#passport))

#### 1. Deploy `PassportLogic`, `PassportLogicRegistry` and `PassportFactory`

The easiest way to deploy `PassportLogic`, `PassportLogicRegistry` and `PassportFactory` contracts would be to use Monetha's `go-verifiable-data` command line utility as instructed [here](https://github.com/monetha/go-verifiable-data/tree/master/cmd/deploy-bootstrap) - it will take care of correctly deploying all three contracts. Of course, contracts can be deployed manually as well (get them [here](https://github.com/monetha/reputation-contracts)).

Another option would be to only deploy `PassportFactory` and reuse `PassportLogic` and `PassportLogicRegistry` contracts deployed by Monetha. In this case, you can use [this](https://github.com/monetha/go-verifiable-data/tree/master/cmd/deploy-passport-factory) utility and provide existing `PassportLogicRegistry` contract address as a parameter. Here are addresses of pre-deployed registry contracts by Monetha:

| Network      | Address                                      |
|---------------|----------------------------------------------|
| `Ropsten`  | [`0x11C96d40244d37ad3Bb788c15F6376cEfA28CF7c`](https://ropsten.etherscan.io/address/0x11C96d40244d37ad3Bb788c15F6376cEfA28CF7c) |
| `Mainnet`  | [`0x53b21DC502b163Bcf3bD9a68d5db5e8E6110E1CC`](https://etherscan.io/address/0x53b21DC502b163Bcf3bD9a68d5db5e8E6110E1CC) |

#### 2. Create digital identity for UNICEF

To easily create a digital identity for UNICEF we can use command line utility provided [here](https://github.com/monetha/go-verifiable-data/tree/master/cmd/deploy-passport). When executing this command provide `PassportFactory` contract address from previous step.

Another possible way to create digital identity is by using `js-verifiable-data` javascript sdk (see [here](https://github.com/monetha/js-verifiable-data#deploying-digital-identity)).

#### 3. Update constants in the app

After we have deployed needed contracts, we have to tell our app to use them. Update constants as follows:

- [/src/constants/addresses.ts](/src/constants/addresses.ts):
  - `export const unicefWalletAddress = '<wallet address that was used to create UNICEF digital identity>'`;
  - `export const unicefPassportAddress = '<UNICEF digital identity address created in step 2>'`;
  - `export const passportFactoryAddress = '<PassportFactory contract address created in step 1>'`;

- [/src/constants/api.ts](/src/constants/api.ts):
  - `export const defaultEthNetworkUrl = '<your Ethereum network URL>';`

#### 4. Build the app

Build production version of app:

```
npm run build
```

Built files will be written to [/build](/build) directory. Put them to the HTTP server of choice with `index.html` as an entry point.

To test app locally, run

```
npm start
```

and dev version of app will be served at http://localhost:3000

## Operation costs

In case if Ethereum mainnet would be chosen to run this dApp a following cost structure would be implied to network members

| Actor | Operation | Cost, ETH | Cost, USD |
| ----- | --------- | --------- | --------- |
| Unicef | Creation of digital identity to maintain a public registry of schools | 0.00464458 | $0.96
| ISP | Registration | 0.0053446 | $1.11 |
| ISP | Provide internet speed for day for a single school | 0.00070066 | $0.15 |
| School | Registering at Unicef | 0.00074366 | $0.15 |
| School | Register a contract with ISP | 0.0007642 | $0.16 |
| School | Report internet speed for a day | 0.00072696 | $0.15 |

Prices were calculated in accordance to **Gas price = 10 GWEI** and **1 ETH = $207.22**

In order to minimize operational costs a publicly open [Quorum](https://www.goquorum.com) blockchain network should be used. In such a case network participants will only require to cover the infrastructure costs of maintaining a Quorum based blockchain where ISPs together with Unicef would be blockchain network members.

## Improvements

- Add more metadata for Schools in order to be able to use data on maps as per [http://school-mapping.azurewebsites.net/](http://school-mapping.azurewebsites.net/) project.
- Add signed agreements contracts to ISP digital identity and store them securely as per Monetha platform documentation of [private data storage](https://github.com/monetha/js-verifiable-data#Private-data) with a possibility to expose data via [private data exchange](https://github.com/monetha/js-verifiable-data#Private-data-exchange).
- Automate speed registration via scheduled job running on School's or ISP machine or even directly from IoT devices. It can be prepared leveraging Monetha Platform SDKs either [Nodejs](github.com/monetha/js-verifiable-data) or [Golang](https://github.com/monetha/go-verifiable-data)
- Improve usability by allowing to use other crypto wallets: MEW, Opera Wallet, Metamask Mobile Wallet.
- Schools can as well create digital identities for participation in other Unicef projects.
- An additional layer for indexing the stored data is needed in order to increase performance of the overview.
- With minor adjustments app could be used with Quorum's, Pantheon's, etc. private transactions since `verifiable-data` already supports them.
- Add filter/search for countries, schools
- Ability to submit transactions without Metamask by keeping encrypted private keys internally and unlocking them by entering custom user password before every submission.
