# User & Programmers Manual

-   [API Overview](#api-overview)
    -   [ISOXML/ADAPT Protocol](#isoxml-adapt-protocol)
    -   [Transport Protocol](#transport-protocol)
-   [Developing new transports](#developing-new-transports)
-   [Development documentation](#development-documentation)

## API Overview

This section describes the specific South-port API implemented by this IoT Agent. For the Configuration API and other
APIs concerning general IoTAgents, check the [API Reference section](#apireference);

### ISOXML/ADAPT Protocol

#### Description

ISOXML is a standard for electronics communications protocol
for agricultural equipment. It fully defined in [ISO 11783](https://www.iso.org/obp/ui/#iso:std:iso:11783:-10:ed-2:v1:en)

#### Measure Payload Syntax

The payload for information update requests consists of a well defined `TASKFILE.XML` message - an XML format defined with the following [XML schema](http://dictionary.isobus.net/isobus/file/supportingDocuments)

E.g.:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<ISO11783_TaskData>
    <FRM A="FRM3" B="Animal Farm" C="Street2" D="PO Box2" E="PostalCode2" F="City2" G="State2" H="Country2" I="CTR2"/>
    <CTR A="CTR2" B="Napoleon the Pig" />
    <TSK A="TSK11" B="mass-based product allocation">
        <PAN A="PDT2" B="004B" C="20000" D="1" E="DET3" F="VPN1">
            <ASP A="2019-11-12T08:00:00" D="4"/>
        </PAN>
    </TSK>
    <PGP A="PGP1" B="Herbicides"/>
    <PDT A="PDT1" B="agent 1" C="PGP1"/>
    <PGP A="PGP2" B="Potato" C="2" />
    <PDT A="PDT2" B="Asterix" C="PGP2"/>
    <VPN A="VPN1" B="0.001" C="1.0" D="0" E="kg"/>
</ISO11783_TaskData>
```

In this example, the message holds multiple entities within a single message.
For example it holds a **Farm** `<FRM>`, a **Customer**  `<CTR>`, a **task** `<TSK>`, two **Product Groups**  `<PGP>`, two **Products**  `<PDT>` and a **Value**  `<VPN>`.

In English, the message is an _"Action Effected"_  `<ASP ... D="4"/>` request from a worker who has done the following:

> On the **12th November**, **Herbicide Agent 1** was sprayed onto
> the **Asterix Potatoes** for the customer **Napoleon the Pig** of
> **Animal Farm**


Each XML element directly beneath `<ISO11783_TaskData>` can be translated directly into an NGSI entity. The attributes (`A`, `B`, `C` etc.) correspond to entity attributes. Sub elements (such as the **Product Allocation** `<PAN>` at a specific **Timestamp** `<ASP>`) can be translated into complex entity attributes of `type=StructuredValue`.
`

The ISOXML will generate eight separate NGSI entities, one for each one of the XML elements found directly below `<ISO11783_TaskData>`. Each one of those requests can contain any number of attributes or complex sub-attributes.


#### Commands Syntax

Commands are messages sent to the MICS from the IoT Agent. A command has the same syntax as a measure received. Typically a _planned_ task will hold a `<ASP ... D="1"/>` element with a future timestamp.

```xml
<ISO11783_TaskData>
    <TSK A=”TSK11” B=”filling example” D=”FRM1” E=”PFD1” G=”1” H=”1” F=”WKR1”>
        <PAN A=”PDT250” B=”0048” C=”50000” D=”1” E=”DET3” F=”VPN1”>
            <ASP A=”2020-02-05T13:00:00” D=”1”/>
        </PAN>
    </TSK>
</ISO11783_TaskData>
```

This indicates that the device `DET3`, lying in field `PFD1` is to be filled with product `PDT250` by worker `WKR1` on the **5th February**

Additional XML elements such comments may also be sent.


##### Commands

To initiate commands as a downlink to the MICS, a service must be registered into the IoT Agent for each message type:

```bash
curl -L -X POST 'http://localhost:4041/iot/services' \
-H 'fiware-service: <fiware-service>' \
-H 'fiware-servicepath: <fiware-servicepath>' \
--data-raw '{
    "services": [
        {
            "apikey": "tsk",
            "cbroker": "http://orion:1026",
            "entity_type": "Activity",
            "resource": "/iot/isoxml",
            "commands": [
                {
                    "name": "send",
                    "type": "command"
                }
            ]
        }
    ]
}'
```

Setting up a `send` command enables a use to send a specific task to the MICS,
additional entities can be supplied in the payload:

```bash
curl -L -X POST 'http://localhost:4041/v2/op/update' \
-H 'fiware-service: openiot' \
-H 'fiware-servicepath: /' \
--data-raw '{
    "actionType": "update",
    "entities": [
        {
            "type": "Activity",
            "id": "urn:ngsi-ld:Activity:TSK3",
            "send" : {
                "type": "command",
                "value": {
                    "entities": ["urn:ngsi-ld:Person:WKR1"]
                }
            }
        }
    ]
}'
```

## Development documentation

### Project build

The project is managed using npm.

For a list of available task, type

```bash
npm run
```

The following sections show the available options in detail.

### Testing

[Mocha](https://mochajs.org/) Test Runner + [Should.js](https://shouldjs.github.io/) Assertion Library.

The test environment is preconfigured to run BDD testing style.

Module mocking during testing can be done with [proxyquire](https://github.com/thlorenz/proxyquire)

To run tests, type

```bash
npm test
```

### Coding guidelines

ESLint

Uses the provided `.eslintrc.json` flag file. To check source code style, type

```bash
npm run lint
```



If you want to continuously check also source code style, use instead:

```bash
npm run watch
```

### Code Coverage

Istanbul/NYC

Analizes the code coverage of your tests.

To generate an HTML coverage report under `site/coverage/` and to print out a summary, type

```bash
# Use git-bash on Windows
npm run test:coverage
```

### Documentation guidelines

remark

To check consistency of the Markdown markup, type

```bash
npm run lint:md
```

textlint

Uses the provided `.textlintrc` flag file. To check for spelling and grammar errors, dead links and keyword consistency,
type

```bash
npm run lint:text
```

### Clean

Removes `node_modules` and `coverage` folders, and `package-lock.json` file so that a fresh copy of the project is
restored.

```bash
# Use git-bash on Windows
npm run clean
```

### Prettify Code

Runs the [prettier](https://prettier.io) code formatter to ensure consistent code style (whitespacing, parameter
placement and breakup of long lines etc.) within the codebase.

```bash
# Use git-bash on Windows
npm run prettier
```

To ensure consistent Markdown formatting run the following:

```bash
# Use git-bash on Windows
npm run prettier:text
```
