ARG NODE_VERSION=14
ARG GITHUB_ACCOUNT=FIWARE
ARG GITHUB_REPOSITORY=iotagent-isoxml
ARG DOWNLOAD=latest
ARG SOURCE_BRANCH=master

# Default Builder, distro and distroless build version
ARG BUILDER=node:${NODE_VERSION}
ARG DISTRO=node:${NODE_VERSION}-slim
ARG DISTROLESS=gcr.io/distroless/nodejs:${NODE_VERSION}
ARG PACKAGE_MANAGER=apt
ARG USER=node

########################################################################################
#
# This build stage retrieves the source code from GitHub. The default download is the 
# latest tip of the master of the named repository on GitHub.
#
# To obtain the latest stable release run this Docker file with the parameters:
# --no-cache --build-arg DOWNLOAD=stable
#
# To obtain any specific version of a release run this Docker file with the parameters:
# --no-cache --build-arg DOWNLOAD=1.7.0
#
# For development purposes, to create a development image including a running Distro, 
# run this Docker file with the parameter:
#
# --target=builder
#
######################################################################################## 
FROM ${BUILDER} AS builder
ARG GITHUB_ACCOUNT
ARG GITHUB_REPOSITORY
ARG DOWNLOAD
ARG SOURCE_BRANCH
ARG PACKAGE_MANAGER

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# hadolint ignore=DL3002
USER root
# hadolint ignore=DL3059, DL3033
RUN \
	# Ensure that the chosen package manger is supported by this Dockerfile
	# also ensure that unzip is installed prior to downloading sources
	if [ "${PACKAGE_MANAGER}" = "apt"  ]; then \
		echo -e "\033[0;34mINFO: Using default \"${PACKAGE_MANAGER}\".\033[0m"; \
		apt-get install -y --no-install-recommends unzip git; \
	elif [ "${PACKAGE_MANAGER}" = "yum"  ]; then \
		echo -e "\033[0;33mWARNING: Overriding default package manager. Using \"${PACKAGE_MANAGER}\" .\033[0m"; \
		yum install -y unzip git; \
		yum clean all; \
	else \
	 	echo -e "\033[0;31mERROR: Package Manager \"${PACKAGE_MANAGER}\" not supported.\033[0m"; \
	 	exit 1; \
	fi

# As an Alternative for local development, just copy this Dockerfile into file the root of 
# the repository and replace the whole RUN statement below by the following COPY statement 
# in your local source using :
#
# COPY . /opt/iotISOXML/
#
# hadolint ignore=DL3008
RUN \
	if [ "${DOWNLOAD}" = "latest" ] ; \
	then \
		RELEASE="${SOURCE_BRANCH}"; \
		echo "INFO: Building Latest Development from ${SOURCE_BRANCH} branch."; \
	elif [ "${DOWNLOAD}" = "stable" ]; \
	then \
		RELEASE=$(curl -s https://api.github.com/repos/"${GITHUB_ACCOUNT}"/"${GITHUB_REPOSITORY}"/releases/latest | grep 'tag_name' | cut -d\" -f4); \
		echo "INFO: Building Latest Stable Release: ${RELEASE}"; \
	else \
	 	RELEASE="${DOWNLOAD}"; \
	 	echo "INFO: Building Release: ${RELEASE}"; \
	fi && \
	RELEASE_CONCAT=$(echo "${RELEASE}" | tr / -); \
	curl -s -L https://github.com/"${GITHUB_ACCOUNT}"/"${GITHUB_REPOSITORY}"/archive/"${RELEASE}".zip > source.zip && \
	unzip source.zip -x "*/test/**" "*/rpm/**" "*/ghpages/**" "*/docs/**" "*/.*" && \
	rm source.zip && \
	mv "${GITHUB_REPOSITORY}-${RELEASE_CONCAT}" /opt/iotISOXML

WORKDIR /opt/iotISOXML

RUN \
	echo "INFO: npm install --production..."; \
	npm update -g; \
	npm install --only=prod --no-package-lock --no-optional

########################################################################################
#
# This build stage installs PM2 if required.
# 
# To create an image using PM2 run this Docker file with the parameter:
#
# --target=pm2-install
#
########################################################################################
FROM ${DISTRO} AS pm2
ARG GITHUB_ACCOUNT
ARG GITHUB_REPOSITORY
ARG NODE_VERSION
ARG USER

LABEL "maintainer"="FIWARE Foundation e.V."
LABEL "description"="An Internet of Things Agent for the ISO 11783 protocol (with HTTP). This IoT Agent is designed to be a bridge between ISOXML/ADAPT and the NGSI interface of a context broker. It is based on the IoT Agent Node.js Library. This project is part of FIWARE. For more information check the FIWARE Catalogue entry for the IoT Agents."
LABEL "name"="iotagent-isoxml"
LABEL "summary"="IoT Agent for the ISOXML/ADAPT protocol for agricultural machinery"

LABEL "org.opencontainers.image.authors"=""
LABEL "org.opencontainers.image.documentation"="https://iotagent-isoxml.readthedocs.io/"
LABEL "org.opencontainers.image.vendor"="Telefónica Investigación y Desarrollo, S.A.U"
LABEL "org.opencontainers.image.licenses"="AGPL-3.0-only"
LABEL "org.opencontainers.image.title"="IoT Agent for the ISOXML/ADAPT protocol with PM2"
LABEL "org.opencontainers.image.description"="IoT Agent for the ISOXML/ADAPT protocol for agricultural machinery (over an HTTP transport)"
LABEL "org.opencontainers.image.source"="https://github.com/${GITHUB_ACCOUNT}/${GITHUB_REPOSITORY}"
LABEL "org.nodejs.version"="${NODE_VERSION}"

COPY --from=builder /opt/iotISOXML /opt/iotISOXML
RUN npm install pm2@4.4.0 -g --no-package-lock --no-optional

USER ${USER}
ENV NODE_ENV=production
# Expose 4041 for NORTH PORT, 7896 for HTTP PORT
EXPOSE ${IOTA_NORTH_PORT:-4041} ${IOTA_HTTP_PORT:-7896}
CMD ["pm2-runtime", "/opt/iotISOXML/bin/iotagent-isoxml", "-- ", "config.js"]
HEALTHCHECK NONE

########################################################################################
#
# This build stage creates an anonymous user to be used with the distroless build
# as defined below.
#
########################################################################################
FROM ${DISTRO} AS anon-user
# hadolint ignore=DL3002
USER root
RUN sed -i -r "/^(root|nobody)/!d" /etc/passwd /etc/shadow /etc/group \
    && sed -i -r 's#^(.*):[^:]*$#\1:/sbin/nologin#' /etc/passwd

########################################################################################
#
# This build stage creates a distroless image for production.
#
# IMPORTANT: For production environments use Docker Secrets to protect values of the 
# sensitive ENV variables defined below, by adding _FILE to the name of the relevant 
# variable.
#
# - IOTA_AUTH_USER, IOTA_AUTH_PASSWORD - when using Keystone Security 
# - IOTA_AUTH_CLIENT_ID, IOTA_AUTH_CLIENT_SECRET - when using OAuth2 Security
#
########################################################################################
FROM ${DISTROLESS} AS distroless
ARG GITHUB_ACCOUNT
ARG GITHUB_REPOSITORY
ARG NODE_VERSION

LABEL "maintainer"="FIWARE Foundation e.V."
LABEL "description"="An Internet of Things Agent for the ISO 11783 protocol (with HTTP). This IoT Agent is designed to be a bridge between ISOXML/ADAPT and the NGSI interface of a context broker. It is based on the IoT Agent Node.js Library. This project is part of FIWARE. For more information check the FIWARE Catalogue entry for the IoT Agents."
LABEL "name"="iotagent-isoxml"
LABEL "summary"="IoT Agent for the ISOXML/ADAPT protocol for agricultural machinery"

LABEL "org.opencontainers.image.authors"=""
LABEL "org.opencontainers.image.documentation"="https://iotagent-isoxml.readthedocs.io/"
LABEL "org.opencontainers.image.vendor"="Telefónica Investigación y Desarrollo, S.A.U"
LABEL "org.opencontainers.image.licenses"="AGPL-3.0-only"
LABEL "org.opencontainers.image.title"="IoT Agent for the ISOXML/ADAPT protocol (Distroless)"
LABEL "org.opencontainers.image.description"="IoT Agent for the ISOXML/ADAPT protocol for agricultural machinery (over an HTTP transport)"
LABEL "org.opencontainers.image.source"="https://github.com/${GITHUB_ACCOUNT}/${GITHUB_REPOSITORY}"
LABEL "org.nodejs.version"="${NODE_VERSION}"

COPY --from=builder /opt/iotISOXML /opt/iotISOXML
COPY --from=anon-user /etc/passwd /etc/shadow /etc/group /etc/
WORKDIR /opt/iotISOXML

USER nobody
ENV NODE_ENV=production
# Expose 4041 for NORTH PORT, 7896 for HTTP PORT
EXPOSE ${IOTA_NORTH_PORT:-4041} ${IOTA_HTTP_PORT:-7896}
CMD ["./bin/iotagent-isoxml", "-- ", "config.js"]
HEALTHCHECK  --interval=30s --timeout=3s --start-period=10s \
  CMD ["/nodejs/bin/node", "./bin/healthcheck"]

########################################################################################
#
# This build stage creates a node-slim image for production.
#
# IMPORTANT: For production environments use Docker Secrets to protect values of the 
# sensitive ENV variables defined below, by adding _FILE to the name of the relevant 
# variable.
#
# - IOTA_AUTH_USER, IOTA_AUTH_PASSWORD - when using Keystone Security 
# - IOTA_AUTH_CLIENT_ID, IOTA_AUTH_CLIENT_SECRET - when using OAuth2 Security
#
########################################################################################
FROM ${DISTRO} AS slim
ARG GITHUB_ACCOUNT
ARG GITHUB_REPOSITORY
ARG NODE_VERSION
ARG USER

LABEL "maintainer"="FIWARE Foundation e.V."
LABEL "description"="An Internet of Things Agent for the ISO 11783 protocol (with HTTP). This IoT Agent is designed to be a bridge between ISOXML/ADAPT and the NGSI interface of a context broker. It is based on the IoT Agent Node.js Library. This project is part of FIWARE. For more information check the FIWARE Catalogue entry for the IoT Agents."
LABEL "name"="iotagent-isoxml"
LABEL "summary"="IoT Agent for the ISOXML/ADAPT protocol for agricultural machinery"

LABEL "org.opencontainers.image.authors"=""
LABEL "org.opencontainers.image.documentation"="https://iotagent-isoxml.readthedocs.io/"
LABEL "org.opencontainers.image.vendor"="Telefónica Investigación y Desarrollo, S.A.U"
LABEL "org.opencontainers.image.licenses"="AGPL-3.0-only"
LABEL "org.opencontainers.image.title"="IoT Agent for the ISOXML/ADAPT protocol"
LABEL "org.opencontainers.image.description"="IoT Agent for the ISOXML/ADAPT protocol for agricultural machinery (over an HTTP transport)"
LABEL "org.opencontainers.image.source"="https://github.com/${GITHUB_ACCOUNT}/${GITHUB_REPOSITORY}"
LABEL "org.nodejs.version"="${NODE_VERSION}"

COPY --from=builder /opt/iotISOXML /opt/iotISOXML
WORKDIR /opt/iotISOXML

USER ${USER}
ENV NODE_ENV=production
# Expose 4041 for NORTH PORT, 7896 for HTTP PORT
EXPOSE ${IOTA_NORTH_PORT:-4041} ${IOTA_HTTP_PORT:-7896}
CMD ["node", "/opt/iotISOXML/bin/iotagent-isoxml", "-- ", "config.js"]
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
   CMD npm run healthcheck

