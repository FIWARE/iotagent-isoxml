ARG  NODE_VERSION=10.17.0-slim
FROM node:${NODE_VERSION}

# IMPORTANT: For production environments use Docker Secrets to protect values of the sensitive ENV 
# variables defined below, by adding _FILE to the name of the relevant variable.
#
# - IOTA_AUTH_USER, IOTA_AUTH_PASSWORD - when using Keystone Security 
# - IOTA_AUTH_CLIENT_ID, IOTA_AUTH_CLIENT_SECRET - when using OAuth2 Security


COPY . /opt/iotISOXML/

WORKDIR /opt/iotISOXML

RUN \
	# Ensure that Git is installed prior to running npm install
	apt-get update && \
	apt-get install -y git && \
	npm install pm2@3.2.2 -g && \
	echo "INFO: npm install --production..." && \
	npm install --production && \
	# Remove Git and clean apt cache
	apt-get clean && \
	apt-get remove -y git && \
	apt-get -y autoremove && \
	chmod +x docker/entrypoint.sh

USER node
ENV NODE_ENV=production

# Expose 4041 for NORTH PORT, 7896 for HTTP PORT
EXPOSE ${IOTA_NORTH_PORT:-4041} ${IOTA_HTTP_PORT:-7896}

ENTRYPOINT ["docker/entrypoint.sh"]
CMD ["-- ", "config.js"]
