# Northcoders News API

https://nc-news-yemz.onrender.com/api


Northcoders News API is an app that collates and displays information about articles on a variety of topics that users can view, vote and comment on.


To run this project locally, first clone this repo:

https://github.com/KennyGoreham/nc_news

To install all the dependencies required for the app to function, run:

```
npm install
```

To create and configure your environment variables to connect to the correct databases, you will need to create .env files for test and development. Your development ENV must be consistent with its reference in the /db/connection.js file.

```js
// in .env.test

PGDATABASE=your_test_database_name_here
```

To connect and setup local databases, run:

```
npm run setup-dbs
```

To populate the databases with test and development data, run:

```
npm run seed
```

This project was built up with "Supertest" and "Jest" which will automatically set your NODE_ENV to 'test' and seed the test database. Tests are separated into test-utils and test-app files, and there are scripts for each in package.json.

This project was built with Node v20.9.0, Postgres v8.7.3 and Express v4.18.2.