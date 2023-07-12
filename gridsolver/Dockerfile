FROM maven:3.8.7-openjdk-18-slim AS BuildEnv
COPY src /opt/src/
COPY pom.xml /opt/pom.xml
WORKDIR /opt/
RUN mvn package

FROM bellsoft/liberica-openjre-alpine:17 AS RuntimeEnv
COPY --from=BuildEnv /opt/target/gridsolver.jar /opt/gridsolver.jar
EXPOSE 4444
CMD ["java", "-jar", "/opt/gridsolver.jar"]