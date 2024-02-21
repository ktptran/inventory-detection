# Inventory Detection Service

## Introduction

Have you ever went to the grocery store and wondered what is in my fridge and what do I have at home?

This project provides a proof of concept view of recording down the inventory automatically using the provisioned resources.

### Objectives and Key Results

1. Provide a platform to automatically record down inventory of items.
2. Provide an interface to view the historical trends.

### Key Performance Indicators (KPIs)

1. Record the inventory within seconds
2. Web platform to view the configuration as needed

## Deployment

### Prerequisites

- python == 3.11
- aws-cli
- aws-cdk >= 2.128.0
- node >= 21.6.1
- npm >= 10.4.0
- http-server >= 14.1.1
- git

### Deployment

Run the following command to build and deploy the inventory detection application. Be sure to setup your AWS account using `aws configure`.

```bash
./scripts/deploy.sh
```

Then run the following command to create a user with a given username and password:

```bash
USERNAME='test'
PASSWORD='ExamplePassword123!'
./scripts/create-user.sh $USERNAME $PASSWORD
```

### Teardown

Once you are finished using the project, use the following command to delete the associated resources.

```bash
./scripts/teardown.sh
```

## Architecture Overview

### Code Layout

| Path         | Description                                                    |
| :----------- | :------------------------------------------------------------- |
| backend/     | source code for Python backend                                 |
| cdk/         | AWS CDK source code                                            |
| docs/        | Swagger UI documentation of API                                |
| frontend/    | source code for React frontend                                 |
| model-data/  | data for Amazon Rekognition training and test datasets         |
| scripts/     | shell scripts to build, deploy, and interact with the project. |
| docs/assets/ | supporting assets for documentation.                           |

### Architecture Diagram

![Architecture Diagram](docs/assets/architecture-diagram.png)

**Amazon Timestream**

AAmazon Timestream is a fast, scalable, serverless managed time series database service for Internet of Things (IoT) and operational applications. Since this is an inventory management system looking at stock over time, Amazon Timestream was a valid option to use.

**Amazon Rekognition**

Amazon Rekognition offers pre-trained and customizable computer vision (CV) capabilities to extract information and insights from your images and videos. This is the main driver for identifying inventory through our trained custom model.
