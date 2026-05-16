FROM amazoncorretto:17-al2-jdk

WORKDIR /app

ARG JAR_FILE=build/libs/*SNAPSHOT.jar
COPY ${JAR_FILE} app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]