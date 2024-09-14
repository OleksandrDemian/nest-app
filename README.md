## Project setup

### Database setup
The project uses Sequelize ORM connected to a MySQL database.
Make sure `ecommerce` database is created in your MySQL server.

The models are automatically created (if required) by Sequelize when the project is started.

### Configure the environment variables

Create `.env` file in the root of the project and add the following variables:
- `DB_HOST` - the host of the database
- `DB_PORT` - the port of the database
- `DB_USERNAME` - the username of the database
- `DB_PASSWORD` - the password of the database
- `DB_NAME` - the name of the database

Example:
```properties
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=<db password>
DB_NAME=ecommerce
```

### Install the dependencies
```bash
yarn install
```

## Compile and run the project

Run development mode

```bash
# development
yarn run start

# watch mode
yarn run start:dev
```

## Run tests

This project contains both unit and e2e tests. The tests rely on a in-memory SQLite database, so you don't need to have a database running to run the tests.

```bash
# unit tests
yarn run test

# e2e tests
yarn run test:e2e

# test coverage
yarn run test:cov
```

## Run prod

Build and run the project in production mode

```bash
yarn run build
yarn run start:prod
```

## API Explorer and Documentation
You can access the API explorer and documentation after running the app by visiting `{host}/api-explorer` in your browser.

