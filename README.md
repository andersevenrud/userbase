# userbase

This is an example of how to set up an Express application to handle user authentication and CRUD via an REST API.

Put together from pieces related to projects at work.

## Technologies

* ORM with Objection.js and Knex
* Authentication via Passport
* Express REST API
* JSON Schema validation
* JWT Token authorization w/refresh tokens
* File storage w/image handling
* Swagger documentation
* Dotenv configurations
* Jest, JSDoc, ESLint

## Installation

```
# Install dependencies
npm install

# Configure environment
cp .env.example .env
edit .env

# Set up database schemas
npm run migrate

# Seed test data
npm run seed

# Start the server
npm run start
```

## Development

See http://localhost:3000/api/swagger for API documentation and testing

Unit test coverage is output to `coverage/`

```
# Launch in monitor mode
npm run start:dev

# Run tests
npm run test

# Run linting
npm run lint
```
