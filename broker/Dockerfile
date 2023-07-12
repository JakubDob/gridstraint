FROM eclipse-temurin:17-alpine

ARG ARTEMIS_VERSION=2.29.0

#Install artemis
WORKDIR /opt
RUN wget "https://repository.apache.org/content/repositories/releases/org/apache/activemq/apache-artemis/${ARTEMIS_VERSION}/apache-artemis-${ARTEMIS_VERSION}-bin.tar.gz" && \
	tar xfz "apache-artemis-${ARTEMIS_VERSION}-bin.tar.gz" && \
	ln -s "/opt/apache-artemis-${ARTEMIS_VERSION}" "/opt/apache-artemis" && \
	rm -f "apache-artemis-${ACTIVEMQ_ARTEMIS_VERSION}-bin.tar.gz"

#Create broker instance
WORKDIR /var/lib
RUN "/opt/apache-artemis/bin/artemis" create artemis \
	--home /opt/apache-artemis \
	--user admin \
	--password admin \
	--role amq \
	--require-login \
	--cluster-user adminCluster \
	--cluster-password adminCluster

EXPOSE 8161
EXPOSE 61616

VOLUME ["/var/lib/artemis/bin"]
VOLUME ["/var/lib/artemis/data"]
VOLUME ["/var/lib/artemis/etc"]

WORKDIR /var/lib/artemis/bin

ENTRYPOINT [ "sh", "artemis", "run" ]