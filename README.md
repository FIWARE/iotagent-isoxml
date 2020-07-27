# IoT Agent for the ISOXML/ADAPT protocol

[![FIWARE IoT Agents](https://nexus.lab.fiware.org/static/badges/chapters/iot-agents.svg)](https://www.fiware.org/developers/catalogue/)
[![License: APGL](https://img.shields.io/github/license/jason-fox/iotagent-ADAPT.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Docker badge](https://img.shields.io/docker/pulls/fiware/iotagent-isoxml.svg)](https://hub.docker.com/r/fiware/iotagent-isoxml/)
[![Support badge](https://nexus.lab.fiware.org/repository/raw/public/badges/stackoverflow/iot-agents.svg)](https://stackoverflow.com/questions/tagged/fiware+iot)
<br/>
[![Documentation badge](https://img.shields.io/readthedocs/fiware-iotagent-isoxml.svg)](http://fiware-iotagent-isoxml.readthedocs.io/en/latest/?badge=latest)
[![Build badge](https://img.shields.io/travis/jason-fox/iotagent-ADAPT.svg)](https://travis-ci.org/jason-fox/iotagent-ADAPT/)
[![Coverage Status](https://coveralls.io/repos/github/jason-fox/iotagent-ADAPT/badge.svg?branch=master)](https://coveralls.io/github/jason-fox/iotagent-ADAPT?branch=master)

An Internet of Things Agent for the ISO 11783 protocol (with [HTTP](https://www.w3.org/Protocols/)). This IoT Agent is designed to be a
bridge between ISOXML/ADAPT and the
[NGSI](https://swagger.lab.fiware.org/?url=https://raw.githubusercontent.com/FIWARE/specifications/master/OpenAPI/ngsiv2/ngsiv2-openapi.json)
interface of a context broker.

It is based on the [IoT Agent Node.js Library](https://github.com/telefonicaid/iotagent-node-lib). Further general
information about the FIWARE IoT Agents framework, its architecture and the common interaction model can be found in the
library's GitHub repository.


| :books: [Documentation](https://fiware-iotagent-isoxml.readthedocs.io)  | :whale: [Docker Hub](https://hub.docker.com/r/fiware/iotagent-isoxml/) | :dart: [Roadmap](https://github.com/jason-fox/iotagent-ADAPT/blob/master/docs/roadmap.md) |
| ------------------------------------------------------------------ |  ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |


## Contents

-   [Background](#background)
-   [Install](#install)
-   [Usage](#usage)
-   [API](#api)
-   [Testing](#testing)
-   [License](#license)

## Background


[ISO 11783](https://www.iso.org/obp/ui/#iso:std:iso:11783:-10:ed-2:v1:en) is a standard for electronics communications protocol 
for agricultural equipment. This _Internet of Things Agent_ is a bridge that can be used to communicate devices using the ISO 11783 
protocol and NGSI Context Brokers (like [Orion](https://github.com/telefonicaid/fiware-orion)). ISO 11783 is an XML file based protocol 
used to pass message data. This IoT Agent does not deal with ISO 11783 communications directly, it is assumed that a separate MICS 
(Mobile Implement control system) server is present which in turn sends files down to devices and receives uploaded files to be processed.

As is the case in any IoT Agent, this one follows the interaction model defined in the
[Node.js IoT Agent Library](https://github.com/telefonicaid/iotagent-node-lib), that is used for the implementation of
the APIs found on the IoT Agent's North Port. Information about the architecture of the IoT Agent can be found on that
global repository. This documentation will only address those features and characteristics that are particular to ISO 11783

Additional information about operating the component can be found in the
[Operations: logs and alarms](docs/operations.md) document.

## Install

Information about how to install the IoT Agent for ISOXML/ADAPT can be found at the corresponding section of the
[Installation & Administration Guide](docs/installationguide.md).

A `Dockerfile` is also available for your use - further information can be found [here](docker/README.md)

## Usage

Information about how to use the IoT Agent can be found in the [User & Programmers Manual](docs/usermanual.md).


## API

Apiary reference for the Configuration API can be found
[here](https://telefonicaiotiotagents.docs.apiary.io/#reference/configuration-api). More information about IoT Agents
and their APIs can be found in the IoT Agent Library [documentation](https://iotagent-node-lib.readthedocs.io/).

The latest IoT Agent for ISOXML/ADAPT documentation is also available on
[ReadtheDocs](https://fiware-iotagent-isoxml.readthedocs.io/en/latest/)

## Testing

[Mocha](https://mochajs.org/) Test Runner + [Should.js](https://shouldjs.github.io/) Assertion Library.

To run tests, type

```console
npm test
```

---

## License

The IoT Agent for ISOXML/ADAPT is licensed under [Affero General Public License (GPL) version 3](./LICENSE).

© 2020 FIWARE Foundation e.V.

### Are there any legal issues with AGPL 3.0? Is it safe for me to use?

There is absolutely no problem in using a product licensed under AGPL 3.0. Issues with GPL (or AGPL) licenses are mostly
related with the fact that different people assign different interpretations on the meaning of the term “derivate work”
used in these licenses. Due to this, some people believe that there is a risk in just _using_ software under GPL or AGPL
licenses (even without _modifying_ it).

For the avoidance of doubt, the owners of this software licensed under an AGPL-3.0 license wish to make a clarifying
public statement as follows:

> Please note that software derived as a result of modifying the source code of this software in order to fix a bug or
> incorporate enhancements is considered a derivative work of the product. Software that merely uses or aggregates (i.e.
> links to) an otherwise unmodified version of existing software is not considered a derivative work, and therefore it
> does not need to be released as under the same license, or even released as open source.
