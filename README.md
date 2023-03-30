# Northcoders House of Games API
https://games-database.onrender.com

## Description
An API for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as reddit) which should provide this information to the front end architecture. The data used is board game reviews, with users, reviews, comments on these reviews, and categories of board game. The database is created using PSQL, with interactions using node-postgres.

## Hosted App Interactions
https://games-database.onrender.com/api
for full list of interactions

## Setup Instructions
1. Clone repo into destination folder using git clone https://github.com/JoeB-G/be-games-project.git
2. After cloning to connect to the databases you will need to create two .env files for this project: .env.test and .env.development
3. In the .env.test file add PGDATABASE=nc_games_test and in the .env.test file add PGDATABASE=nc_games
4. Ensure you have nodejs version 19.7.0 or later, and Postgres version 14.7 or later installed
5. run "npm install" to install dependencies: {
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "pg": "^8.7.3",
    "supertest": "^6.3.3",
    "pg-format": "^1.0.4"
  },
  and devDependencies: {
    "husky": "^8.0.2",
    "jest": "^27.5.1",
    "jest-extended": "^2.0.0",
    "jest-sorted": "^1.0.14"
  }

## Create and Seed Local Database
1. run "npm run setup-dbs" to create nc_games database
2. run "npm run seed" to seed development data into nc_games database

## Run Tests
1. run "npm run seed-dbs" to create nc_games_test database
2. run "npm test" to run all tests for app and utility functions
