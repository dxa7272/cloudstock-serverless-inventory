# CloudStock

CloudStock is a serverless inventory and order management system built using AWS services and React.

The project demonstrates how a modern cloud application can manage products, inventory, orders, authentication, alerts, analytics, and monitoring using a serverless architecture.

## Architecture

CloudStock currently uses:

- Amazon API Gateway
- AWS Lambda
- Amazon DynamoDB
- Amazon Cognito
- Amazon SNS
- Amazon S3
- Amazon CloudWatch
- React
- Vite

## Current Features

- User authentication with Amazon Cognito
- ADMIN and EMPLOYEE user roles
- Create products
- View products
- Update products
- Delete products
- Inventory management
- Prevent negative inventory
- Create customer orders
- Automatically reduce inventory after an order
- Low-stock email alerts
- Product image storage using S3
- Sales analytics
- CloudWatch logging and monitoring
- React frontend

## Serverless Architecture

```text
React Frontend
      |
      v
Amazon API Gateway
      |
      v
AWS Lambda
      |
      v
Amazon DynamoDB

