# FIWARE IoT Agent for the ISOXML/ADAPT protocol

[![FIWARE IoT Agents](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/iot-agents.svg)](https://www.fiware.org/developers/catalogue/)
[![](https://nexus.lab.fiware.org/repository/raw/public/badges/stackoverflow/iot-agents.svg)](https://stackoverflow.com/questions/tagged/fiware+iot)

An Internet of Things Agent for the ISOXML/ADAPT protocol (with an [HTTP](https://www.w3.org/Protocols/)). This IoT
Agent is designed to be a bridge between ISOXML and the
[NGSI](https://swagger.lab.fiware.org/?url=https://raw.githubusercontent.com/Fiware/specifications/master/OpenAPI/ngsiv2/ngsiv2-openapi.json)
interface of a context broker.

It is based on the [IoT Agent Node.js Library](https://github.com/telefonicaid/iotagent-node-lib). Further general
information about the FIWARE IoT Agents framework, its architecture and the common interaction model can be found in the
library's GitHub repository.

## How to use this image

The IoT Agent must be instantiated and connected to an instance of the
[Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/), a sample `docker-compose` file can be found
below.

If the `IOTA_REGISTRY_TYPE=mongodb`, a [MongoDB](https://www.mongodb.com/) database instance is also required - the
example below assumes that you have a `/data` directory in your hosting system in order to hold database files - please
amend the attached volume to suit your own configuration.

```yml
version: '3.1'

volumes:
    mongodb: ~

services:
    iot-agent:
        image: quay.io/fiware/iotagent-isoxml
        hostname: iot-agent
        container_name: fiware-iot-agent
        depends_on:
            - mongodb
        expose:
            - '4061'
            - '7896'
        ports:
            - '4061:4061'
            - '7896:7896'
        environment:
            - IOTA_CB_HOST=orion
            - IOTA_CB_PORT=1026
            - IOTA_NORTH_PORT=4061
            - IOTA_REGISTRY_TYPE=mongodb
            - IOTA_MONGO_HOST=mongodb
            - IOTA_MONGO_PORT=27017
            - IOTA_MONGO_DB=iotagent-isoxml
            - IOTA_HTTP_PORT=7896
            - IOTA_PROVIDER_URL=http://iot-agent:4061
            - IOTA_DEFAULT_MICS_ENDPOINT=http://mics-server/iot/isoxml
            - IOTA_DEFAULT_RESOURCE=/iot/isoxml

    mongodb:
        image: mongo:3.6
        hostname: mongodb
        container_name: db-mongo
        ports:
            - '27017:27017'
        command: --bind_ip_all --smallfiles
        volumes:
            - mongodb:/data

    orion:
        image: fiware/orion
        hostname: orion
        container_name: fiware-orion
        depends_on:
            - mongodb
        expose:
            - '1026'
        ports:
            - '1026:1026'
        command: -dbhost mongodb
```

## Configuration with environment variables

Many settings can be configured using Docker environment variables. A typical IoT Agent Docker container is driven by
environment variables such as those shown below:

-   `IOTA_CB_HOST` - Hostname of the context broker to update context
-   `IOTA_CB_PORT` - Port that context broker listens on to update context
-   `IOTA_NORTH_PORT` - Port used for configuring the IoT Agent and receiving context updates from the context broker
-   `IOTA_REGISTRY_TYPE` - Whether to hold IoT device info in memory or in a database
-   `IOTA_MONGO_HOST` - The hostname of MongoDB - used for holding device and service information
-   `IOTA_MONGO_PORT` - The port that MongoDB is listening on
-   `IOTA_MONGO_DB` - The name of the database used in MongoDB
-   `IOTA_HTTP_PORT` - The port where the IoT Agent listens for IoT device traffic over HTTP
-   `IOTA_PROVIDER_URL` - URL passed to the Context Broker when commands are registered, used as a forwarding URL
    location when the Context Broker issues a command to a device
-   `IOTA_DEFAULT_MICS_ENDPOINT` - the location of the Mobile Implement control system server.
-   `IOTA_DEFAULT_RESOURCE=/iot/isoxml` - the path of the URL the IoT Agent is listening on on the south port.

### Architecture

This IoT Agent is not standalone, but relies on a separate micro service to act as a MICS (Mobile Implement control
system) The MICS would in turn send files down to devices and receive uploaded files to be processed.

A minimal MICS would listen and forward ISOXML messages to the IoT Agent as shown

```console
curl -L -X POST 'http://iotagent:7896/iot/isoxml' \
-H 'Content-Type: application/xml' \
--data-raw '<?xml version="1.0" encoding="utf-8" ?>
<ISO11783_TaskData>
    <TSK A="TSK1" F="WKR1" G="1">
        <OTP A="CPC1" B="OTQ1"/>
        <WAN A="WKR1">
            <ASP A="2020-08-20T08:00:00" B="2020-08-20T17:00:00" D="1"/>
        </WAN>
        <DAN B="7FFFFFFF00000000" A="200C840000000000">
            <ASP A="2020-08-20T08:00:00" B="2020-08-20T17:00:00" D="1"/>
        </DAN>
        <CNN A="DVC2" B="DET2" C="DVC1" D="DET2"/>
        <DLT A="1122" B="1" H="DET2"/>
        <CAN A="CCT5">
            <ASP A="2003-08-20T08:00:20" D="4">
                <PTN A="54.588945" B="9.989209" D="3"/>
            </ASP>
        </CAN>
        <TZN A="1" B="200" C="140"/>
        <TIM A="2003-08-20T08:00:00" B="2003-08-20T17:00:00" D="1"/>
    </TSK>
</ISO11783_TaskData>'
```

### Further Information

The full set of overrides for the general parameters applicable to all IoT Agents are described in the Configuration
section of the IoT Agent Library
[Installation Guide](https://iotagent-node-lib.readthedocs.io/en/latest/installationguide/index.html#configuration).

Further settings for IoT Agent for Ultralight itself - such as specific configurations for MQTT, AMPQ and HTTP - can be
found in the IoT Agent for Ultralight
[Installation Guide](https://fiware-iotagent-isoxml.readthedocs.io/en/latest/installationguide/index.html#configuration).

## How to build an image

The [Dockerfile](https://github.com/telefonicaid/iotagent-isoxml/blob/master/docker/Dockerfile) associated with this
image can be used to build an image in several ways:

-   By default, the `Dockerfile` retrieves the **latest** version of the codebase direct from GitHub (the `build-arg` is
    optional):

```console
docker build -t iot-agent . --build-arg DOWNLOAD=latest
```

-   You can alter this to obtain the last **stable** release run this `Dockerfile` with the build argument
    `DOWNLOAD=stable`

```console
docker build -t iot-agent . --build-arg DOWNLOAD=stable
```

-   You can also download a specific release by running this `Dockerfile` with the build argument `DOWNLOAD=<version>`

```console
docker build -t iot-agent . --build-arg DOWNLOAD=1.7.0
```

## Building from your own fork

To download code from your own fork of the GitHub repository add the `GITHUB_ACCOUNT`, `GITHUB_REPOSITORY` and
`SOURCE_BRANCH` arguments (default `master`) to the `docker build` command.

```console
docker build -t iot-agent . \
    --build-arg GITHUB_ACCOUNT=<your account> \
    --build-arg GITHUB_REPOSITORY=<your repo> \
    --build-arg SOURCE_BRANCH=<your branch>  \
    --target=distroless|pm2|slim
```

## Building from your own source files

Alternatively, if you want to build directly from your own sources, please copy the existing `Dockerfile` into file the
root of the repository and amend it to copy over your local source using :

```Dockerfile
COPY . /opt/iotISOXML/
```

Full instructions can be found within the `Dockerfile` itself.

### Using PM2 /Distroless

The IoT Agent within the Docker image can be run encapsulated within the [pm2](http://pm2.keymetrics.io/) Process
Manager by using the associated `pm2` Image.

```console
docker run --name iotagent -d fiware/iotagent-isoxml
```

The IoT Agent within the Docker image can be run from a distroless container
Manager by using the associated `distroless` Image.

```console
docker run --name iotagent -d fiware/iotagent-isoxml-distroless
```


## Building using an alternative sources and Linux Distros

The `Dockerfile` is flexible enough to be able to use
[alternative base images](https://kuberty.io/blog/best-os-for-docker/) should you wish. The base image defaults to using
the `node:slim` distro, but other base images can be injected using `--build-arg` parameters on the commmand line. For
example, to create a container based on
[Red Hat UBI (Universal Base Image) 8](https://developers.redhat.com/articles/2021/11/08/optimize-nodejs-images-ubi-8-nodejs-minimal-image)
add `BUILDER`, `DISTRO`, `PACKAGE_MANAGER` and `USER` parameters as shown:

```console
docker build -t iot-agent \
  --build-arg BUILDER=registry.access.redhat.com/ubi8/nodejs-14 \
  --build-arg DISTRO=registry.access.redhat.com/ubi8/nodejs-14-minimal \
  --build-arg PACKAGE_MANAGER=yum \
  --build-arg USER=1001 . --no-cache
```

Currently, the following `--build-arg` parameters are supported:

| Parameter           | Description                                                                                                                                                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BUILDER`           | Preferred [linux distro](https://kuberty.io/blog/best-os-for-docker/) to use whilst building the image, defaults to `node:${NODE_VERSION}`                                                                                                                                              |
| `DISTRO`            | Preferred [linux distro](https://kuberty.io/blog/best-os-for-docker/) to use for the final container image, defaults to `node:${NODE_VERSION}-slim`                                                                                                                                     |
| `DISTROLESS`        | Preferred [Distroless Image](https://betterprogramming.pub/how-to-harden-your-containers-with-distroless-docker-images-c2abd7c71fdb) to use for the final container. Distroless images can be built using `-target=distroless` , defaults to `gcr.io/distroless/nodejs:${NODE_VERSION}` |
| `DOWNLOAD`          | The GitHub SHA or tag to download - defaults to `latest`                                                                                                                                                                                                                                |
| `GITHUB_ACCOUNT`    | The GitHub Action to download the source files from, defaults to `ging`                                                                                                                                                                                                                 |
| `GITHUB_REPOSITORY` | The name of the GitHub repository to download the source files from, defaults to `fiware-pep-proxy`                                                                                                                                                                                     |
| `NODE_VERSION`      | the version of Node.js to use                                                                                                                                                                                                                                                           |
| `PACKAGE_MANAGER`   | Package manager to use whilst creating the build, defaults to `apt`                                                                                                                                                                                                                     |
| `SOURCE_BRANCH`     | The GitHub repository branch to download the source files from, defaults to `master`                                                                                                                                                                                                    |
| `USER`              | User in the final container image, defaults to `node`                                                                                                                                                                                                                                   |

### Docker Secrets

As an alternative to passing sensitive information via environment variables, `_FILE` may be appended to some sensitive
environment variables, causing the initialization script to load the values for those variables from files present in
the container. In particular, this can be used to load passwords from Docker secrets stored in
`/run/secrets/<secret_name>` files. For example:

```console
docker run --name iotagent -e IOTA_AUTH_PASSWORD_FILE=/run/secrets/password -d fiware/iotagent-isoxml
```

Currently, this `_FILE` suffix is supported for:

-   `IOTA_AUTH_USER`
-   `IOTA_AUTH_PASSWORD`
-   `IOTA_AUTH_CLIENT_ID`
-   `IOTA_AUTH_CLIENT_SECRET`
-   `IOTA_MONGO_USER`
-   `IOTA_MONGO_PASSWORD`
-   `IOTA_MQTT_KEY`
-   `IOTA_MQTT_USERNAME`
-   `IOTA_MQTT_PASSWORD`
-   `IOTA_AMQP_USERNAME`
-   `IOTA_AMQP_PASSWORD`

## Best Practices

### Increase ULIMIT in Docker Production Deployments

Default settings for ulimit on a Linux system assume that several users would share the system. These settings limit the
number of resources used by each user. The default settings are generally very low for high performance servers and
should be increased. By default, we recommend, that the IoTAgent - UL server in high performance scenarios, the
following changes to ulimits:

```console
ulimit -n 65535        # nofile: The maximum number of open file descriptors (most systems do not allow this
                                 value to be set)
ulimit -c unlimited    # core: The maximum size of core files created
ulimit -l unlimited    # memlock: The maximum size that may be locked into memory
```

If you are just doing light testing and development, you can omit these settings, and everything will still work.

To set the ulimits in your container, you will need to run IoTAgent - UL Docker containers with the following additional
--ulimit flags:

```console
docker run --ulimit nofile=65535:65535 --ulimit core=100000000:100000000 --ulimit memlock=100000000:100000000 \
--name iotagent -d fiware/iotagent-isoxml
```

Since “unlimited” is not supported as a value, it sets the core and memlock values to 100 GB. If your system has more
than 100 GB RAM, you will want to increase this value to match the available RAM on the system.

> Note: The --ulimit flags only work on Docker 1.6 or later. Nevertheless, you have to "request" more resources (i.e.
> multiple cores), which might be more difficult for orchestrates ([Docker Engine](https://docs.docker.com/engine) or
> [Kubernetes](https://kubernetes.io)) to schedule than a few different containers requesting one core (or less...) each
> (which it can, in turn, schedule on multiple nodes, and not necessarily look for one node with enough available
> cores).

If you want to get more details about the configuration of the system and node.js for high performance scenarios, please
refer to the [Installation Guide](https://fiware-iotagent-isoxml.rtfd.io/en/latest/installationguide/index.html).

### Set-up appropriate Database Indexes

If using Mongo-DB as a data persistence mechanism (i.e. if `IOTA_REGISTRY_TYPE=mongodb`) the device and service group
details are retrieved from a database. The default name of the IoT Agent database is `iotagentisoxml`. Database access
can be optimized by creating appropriate indices.

For example:

```console
docker exec  <mongo-db-container-name> mongo --eval '
	conn = new Mongo();
	db = conn.getDB("iotagentisoxml");
	db.createCollection("devices");
	db.devices.createIndex({"_id.service": 1, "_id.id": 1, "_id.type": 1});
	db.devices.createIndex({"_id.type": 1});
	db.devices.createIndex({"_id.id": 1});
	db.createCollection("groups");
	db.groups.createIndex({"_id.resource": 1, "_id.apikey": 1, "_id.service": 1});
	db.groups.createIndex({"_id.type": 1});' > /dev/null
```

The name of the database can be altered using the `IOTA_MONGO_DB` environment variable. Alter the `conn.getDB()`
statement above if an alternative database is being used.
