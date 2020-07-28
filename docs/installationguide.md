# Installation & Administration Guide

-   [Installation](#installation)
-   [Usage](#usage)
-   [Packaging](#packaging)
-   [Configuration](#configuration)

## Installation

There are two ways of installing the ISOXML/ADAPT Agent: cloning the GitHub repository, or using Docker. Regardless of
the installation method, there are some middlewares that must be present, as a prerequisite for the component
installation (no installation instructions are provided for these middlewares):

-   A [MongoDB](https://www.mongodb.com/) instance (v3.2+) is required for those IoT Agents configured to have
    persistent storage. An in-memory storage repository is also provided for testing purposes.

-   The IoT Agent purpose is to connect devices (using a native device protocol on the South Port of the IoT Agent) and
    NGSI endpoints on the North Port of the IoT Agent - typically a NGSI Context Broker, like
    [Orion](https://github.com/telefonicaid/fiware-orion)), so an accessible Context Broker is also required. IoT Agents
    were tested with v0.26.0 (higher versions should also work).

-   This IoT Agent is not standalone, but relies on a separate micro service to act as a MICS (Mobile Implement control
    system) The MICS would in turn send files down to devices and receive uploaded files to be processed.

Please, follow the links to the official Web Pages to find how can you install each of the middlewares in your
environment.

The following sections describe each installation method in detail.

#### Cloning the GitHub repository

Clone the repository with the following command:

```bash
git clone https://github.com/FIWARE/iotagent-isoxml.git
```

Once the repository is cloned, from the root folder of the project execute:

```bash
npm install
```

This will download the dependencies for the project, and let it ready to the execution.

When the component is executed from a cloned GitHub repository, it takes the default config file that can be found in
the root of the repository.

#### Using Docker

There are interminent builds of the development version of the IoT Agent published in Docker hub. In order to install
using the docker version, just execute the following:

```bash
docker run -d --link orion:orion --link mongo:mongo -p 7896:7896 -p 4061:4061 fiware/iotagent-isoxml
```

As you can see, the ISOXML/ADAPT IoT Agent (as any other IoT Agent) requires some docker dependencies to work:

-   **mongo**: Mongo database instance (to store provisioning data).
-   **orion**: Orion Context Broker.

In order to link them, deploy them using docker and use the option `--link` as shown in the example. You may also want
to map the external IoT Agent North and South ports, for external calls: 4061 (NGSI Interactions for traffic north of
the IoT Agent) and 7896 (HTTP binding for traffic south of the IoT Agent to and from the MICS).

#### Build your own Docker image

There is also the possibility to build your own local Docker image of the IoT Agent component.

To do it, follow the next steps once you have installed Docker in your machine:

1.  Navigate to the path where the component repository was cloned.
2.  Launch a Docker build
    -   Using the default NodeJS version of the operating system used defined in FROM keyword of Dockerfile:
    ```bash
    sudo docker build -f Dockerfile .
    ```
    -   Using an alternative NodeJS version:
    ```bash
    sudo docker build --build-arg NODE_VERSION=10.17.0-slim -f Dockerfile .
    ```

## Usage

#### GitHub installation

In order to execute the IoT Agent, just issue the following command from the root folder of the cloned project:

```bash
bin/iotagent-isoxml [config file]
```

The optional name of a config file is optional and described in the following section.

#### Docker installation

The Docker automatically starts listening in the API ports, so there is no need to execute any process in order to have
the application running. The Docker image will automatically start.

## Configuration

All the configuration for the IoT Agent resides in the `config.js` file, in the root of the application. This file is a
JavaScript file, that contains the following sections:

-   **config.iota**: general IoT Agent configuration. This group of attributes is common to all types of IoT Agents, and
    is described in the global
    [IoT Agent Library Documentation](https://github.com/telefonicaid/iotagent-node-lib#configuration).
    -   **config.iota.types**: Lists the ISOXML messages which are to be processed.
    -   **config.iota.isoxmlType**: Holds the name of the attribute designating the ISOXML message type.
-   **config.http**: configuration for the HTTP transport protocol binding of the IoT Agent (described in the following
    subsections).
-   **config.defaultKey**: default API Key, for devices lacking a provided Configuration.
-   **config.defaultTransport**: code of the MQTT transport that will be used to resolve incoming commands and lazy
    attributes in case a transport protocol could not be inferred for the device.

#### Message Types

All ISOXML messages are anonymous and identified by `apikey` only - no individual devices are provisioned. The list of
acceptable messages is defined within the **config.iota.types** configuration as shown:

```javascript
const types = {
    Customer: { apikey: 'ctr' },
    Device: { apikey: 'dvc' },
    Farm: { apikey: 'frm' },
    OperationTechnique: { apikey: 'otq' },
    PartField: { apikey: 'pfd' }
};
```

Each `apikey` corresponds to a message type found in the `/lib/adapters/isoxml` directory. For example the ISOXML
`<FRM>` message is mapped onto the **Building** NGSI Data model by exposing the following constants in `farm.js`

```javascript
const isoxmlType = 'FRM';
const ngsiType = 'Building';
```

Additional `static_attributes` can also be provisioned for each entity type.

```javascript
    Customer : {
        apikey: "ctr",
        static_attributes: [
            {
                name: "hasOccupation",
                type: "Occupation",
                value: {
                    name: "Customer"
                }
            }
        ]
    },
```

Overrides and additional custom message types can also be created by placing files into the `/conf` directory.

#### HTTP Binding configuration

The `config.http` section of the config file contains all the information needed to start the HTTP server for the HTTP
transport protocol binding. The following options are accepted:

-   **port**: South Port where the HTTP listener will be listening for information from the devices.
-   **timeout**: HTTP Timeout for the HTTP endpoint (in milliseconds).
-   **key**: Path to your private key for HTTPS binding
-   **cert**: Path to your certificate for HTTPS binding
-   **mics_endpoint** : Path to the MICS (Mobile Implement control system) server

#### Configuration with environment variables

Some of the more common variables can be configured using environment variables. The ones overriding general parameters
in the `config.iota` set are described in the
[IoT Agent Library Configuration manual](https://github.com/telefonicaid/iotagent-node-lib#configuration).

The ones relating specific ISOXML/ADAPT bindings are described in the following table.

| Environment variable            | Configuration attribute |
| :------------------------------ | :---------------------- |
| IOTA_HTTP_HOST                  | http.host               |
| IOTA_HTTP_PORT                  | http.port               |
| IOTA_HTTP_TIMEOUT               | http.timeout            |
| IOTA_HTTP_KEY                   | http.key                |
| IOTA_HTTP_CERT                  | http.cert               |
| IOTA_HTTP_DEFAULT_MICS_ENDPOINT | http.mics_endpoint      |

#### High performance configuration

Node.js is single‑threaded and uses nonblocking I/O, allowing it to scale up to tens of thousands of concurrent
operations. Nevertheless, Node.js has a few weak points and vulnerabilities that can make Node.js‑based systems to offer
underperformance behaviour, specially when a Node.js web application experiences rapid traffic growth.

Additionally, It is important to know the place in which the node.js server is running, because it has limitations.
There are two types of limits on the host: hardware and software. Hardware limits can be easy to spot. Your application
might be consuming all of the memory and needing to consume disk to continue working. Adding more memory by upgrading
your host, whether physical or virtual, seems to be the right choice.

Moreover, Node.js applications have also a software memory limit (imposed by V8), therefore we cannot forget about these
limitations when we execute a service. In this case of 64-bit environment, your application would be running by default
at a 1 GB V8 limit. If your application is running in high traffic scenarios, you will need a higher limit. The same is
applied to other parameters.

It means that we need to make some changes in the execution of node.js and in the configuration of the system:

-   **Node.js flags**

    -   **--use-idle-notification**

        Turns of the use idle notification to reduce memory footprint.

    -   **--expose-gc**

        Use the expose-gc command to enable manual control of the garbage collector from the own node.js server code. In
        case of the IoTAgent, it is not implemented because it is needed to implement the calls to the garbage collector
        inside the ser server, nevertheless the recommended value is every 30 seconds.

    -   **--max-old-space-size=xxxx**

        In that case, we want to increase the limit for heap memory of each V8 node process in order to use max capacity
        that it is possible instead of the 1,4Gb default on 64-bit machines (512Mb on a 32-bit machine). The
        recommendation is at least to use half of the total memory of the physical or virtual instance.

-   **User software limits**

    Linux kernel provides some configuration about system related limits and maximums. In a distributed environment with
    multiple users, usually you need to take into control the resources that are available for each of the users.
    Nevertheless, when the case is that you have only one available user but this one request a lot of resources due to
    a high performance application the default limits are not proper configured and need to be changed to resolve the
    high performance requirements. These are like maximum file handler count, maximum file locks, maximum process count
    etc.

    You can see the limits of your system executing the command: `ulimit -a`

    You can detine the corresponding limits inside the file limits.conf. This description of the configuration file
    syntax applies to the `/etc/security/limits.conf` file and `*.conf` files in the `/etc/security/limits.d` directory.
    You can get more information about the limits.conf in the
    [limits.conf - linux man pages](http://man7.org/linux/man-pages/man5/limits.conf.5.html). The recommended values to
    be changes are the following:

    -   **core**

        Limits of the core file size in KB, we recommend to change to `unlimited` both hard and soft types.

            * soft core unlimited
            * hard core unlimited

    -   **data**

        Maximum data size in KB, we recommend to change to `unlimited` both hard and soft types.

            * soft data unlimited
            * hard data unlimited

    -   **fsize**

        Maximum filesize in KB, we recommend to change to `unlimited` both hard and soft types.

            * soft fsize unlimited
            * hard fsize unlimited

    -   **memlock**

        Maximum locked-in-memory address space in KB, we recommend to change to `unlimited` both hard and soft types.

            * memlock unlimited
            * memlock unlimited

    -   **nofile**

        Maximum number of open file descriptors, we recommend to change to `65535` both hard and soft types.

            * soft nofile 65535
            * hard nofile 65535

    -   **rss**

        Maximum resident set size in KB (ignored in Linux 2.4.30 and higher), we recommend to change to `unlimited` both
        hard and soft types.

            * soft rss unlimited
            * hard rss unlimited

    -   **stack**

        Maximum stack size in KB, we recommend to change to `unlimited` both hard and soft types.

            * soft stack unlimited
            * hard stack unlimited

    -   **nproc**

        Maximum number of processes, we recommend to change to `unlimited` both hard and soft types.

            * soft nproc unlimited
            * hard nproc unlimited

    You can take a look to the [limits.conf](limits.conf) file provided in this folder with all the values provided.

-   **Configure kernel parameters**

    sysctl is used to modify kernel parameters at runtime. We plan to modify the corresponding `/etc/sysctl.conf` file.
    You can get more information in the corresponding man pages of
    [sysctl](http://man7.org/linux/man-pages/man8/sysctl.8.html) and
    [sysctl.conf](http://man7.org/linux/man-pages/man5/sysctl.conf.5.html). You can search all the kernel parameters by
    using the command `sysctl -a`

    -   **fs.file-max**

        The maximum file handles that can be allocated, the recommended value is `1000000`.

            fs.file-max = 1000000

    -   **fs.nr_open**

        Max amount of file handles that can be opened, the recommended value is `1000000`.

            fs.nr_open = 1000000

    -   **net.netfilter.nf_conntrack_max**

        Size of connection tracking table. Default value is nf_conntrack_buckets value \* 4.

            net.nf_conntrack_max = 1048576

    For more details about any other kernel parameters, take a look to the example [sysctl.conf](sysctl.conf) file.
