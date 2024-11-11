const { Sequelize, DataTypes, Model } = require("sequelize");
const { pg } = require("pg");
// Option 1: Passing a connection URI
// const sequelize = new Sequelize('sqlite::memory:') // Example for sqlite
// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname') // Example for postgres

// Option 2: Passing parameters separately (sqlite)
// const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: 'path/to/database.sqlite'
// });

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize("E-Commerce", "postgres", "welcome321", {
  host: "localhost",
  dialect: "postgres",
  dialectModule: pg,
  port: 5433
});

// const User = sequelize.define(
//   'User',
//   {
//     // Model attributes are defined here
//     firstName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     lastName: {
//       type: DataTypes.STRING,
//       // allowNull defaults to true
//     },
//   },
//   {
//     // Other model options go here
//   },
// );

// async function authenticate() {
//   try {
//     // await sequelize.authenticate();
//     console.log("Connection has been established successfully.");
//     sequelize.sync({ force: true }).then(() => {
//       console.log("The User table has been created");
//     })
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// }

// authenticate();

module.exports = sequelize;
