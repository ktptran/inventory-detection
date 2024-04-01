# Swagger UI Documentation

## Introduction

[Swagger UI](https://swagger.io/tools/swagger-ui/) allows anyone — be it your development team or your end consumers — to visualize and interact with the API’s resources without having any of the implementation logic in place. It’s automatically generated from your OpenAPI (formerly known as Swagger) Specification, with the visual documentation making it easy for back end implementation and client side consumption.

`swagger.yaml` is the Swagger file containing the API and schema documentation.

## Pre-requisites

In order to launch Swagger UI, you need to prepare a web server using the following command line. Here we will use Node.js' http-server module.

```bash
npm install -g http-server
```

## Starting http-server & launching Swagger UI

From the root directory of the project run the following command:

```bash
./scripts/launch-swagger-ui.sh
```

This will launch an http-server available via http://localhost:8080 to read the `swagger.yaml` file.
