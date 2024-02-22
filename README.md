# Northcoders News API

https://nc-news-yemz.onrender.com/api


Northcoders News API is an app that collates and displays information about articles on a variety of topics that users can view, vote and comment on.


To run this project locally, first clone this repo:

https://github.com/KennyGoreham/nc_news

Run "npm install" to install all the dependencies required for the app to function

To create and configure your environment variables to connect to the correct databases, you will need to create .env files for test and development (e.g. in .env.test "PGDATABASE=your_test_database_name_here"). Your development ENV must be consistent with its reference in the /db/connection.js file.

To connect and setup local databases, run the "setup-dbs" script. Then run the "seed" script to populate your databases with test and development data.

This project was built with "Supertest" and "Jest" which will automatically set your NODE_ENV to 'test' and seed the test database. To run the tests, use the "test" script.

This project was built with Node v20.9.0 and Postgres v8.7.3. 