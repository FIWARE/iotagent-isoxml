# Welcome to the FIWARE IoT Agent for ISOXML/ADAPT

[![FIWARE IoT Agents](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/iot-agents.svg)](https://www.fiware.org/developers/catalogue/)
[![](https://nexus.lab.fiware.org/repository/raw/public/badges/stackoverflow/iot-agents.svg)](https://stackoverflow.com/questions/tagged/fiware+iot)

An Internet of Things Agent for the ISO 11783 protocol (with [HTTP](https://www.w3.org/Protocols/)). This IoT Agent is designed to be a
bridge between ISOXML/ADAPT and the
[NGSI](https://swagger.lab.fiware.org/?url=https://raw.githubusercontent.com/FIWARE/specifications/master/OpenAPI/ngsiv2/ngsiv2-openapi.json)
interface of a context broker.

[ISO 11783](https://www.iso.org/obp/ui/#iso:std:iso:11783:-10:ed-2:v1:en) is a standard for electronics communications protocol
for agricultural equipment. This _Internet of Things Agent_ is a bridge that can be used to communicate devices using the ISO 11783
protocol and NGSI Context Brokers (like [Orion](https://github.com/telefonicaid/fiware-orion)). ISO 11783 is an XML file based protocol
used to pass message data. This IoT Agent does not deal with ISO 11783 communications directly, it is assumed that a separate MICS
(Mobile Implement control system) server is present which in turn sends files down to devices and receives uploaded files to be processed.

Github's [README.md](https://github.com/telefonicaid/iotagent-ul/blob/master/README.md) provides a good documentation
summary. The [User Manual](usermanual.md) and the [Admin Guide](installationguide.md) cover more advanced topics.
