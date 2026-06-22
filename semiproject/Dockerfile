FROM gradle:8-jdk17 AS build
WORKDIR /app
COPY . .
RUN chmod +x gradlew
RUN gradle build -x test

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
