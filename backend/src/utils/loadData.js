// seeders/seedProducts.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Category = require('../models/Category');
// const Product = require('../models/Product');
const sequelize = require('../config/database');

const loadData = async (Model, fileName) => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Sync the model
    await sequelize.sync();

    // Read the CSV file
    const results = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.resolve(__dirname + '/../db/data/', fileName))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });
    try {
      // Insert data into the database
      for (const row of results) {
        console.log(`Inserting row: ${JSON.stringify(row)}`);
        await Model.create({
          name: row.categories, // Make sure this matches your CSV column name
        });
      }
      console.log('Data seeded successfully.');
    } catch (error) {
      console.error('Error inserting data:', error);
    } finally {
      await sequelize.close();
      console.log('Database connection closed.');
    }
    // fs.createReadStream(path.resolve(__dirname + '/../db/data/', fileName))
    //   .pipe(csv())
    //   .on('data', (data) => results.push(data))
    //   .on('end', async () => {
    //     console.log('===============++============');
    //     console.log(results);
    //     console.log('===============++============');

    //     try {
    //       // Insert data into the database
    //       for (const row of results) {
    //         await Model.create({
    //           name: row.categories,
    //         });
    //       }
    //       console.log('Data seeded successfully.');
    //     } catch (error) {
    //       console.error('Error inserting data:', error);
    //     } finally {
    //       await sequelize.close();
    //     }
    //   }
    // )
    // .on('error', (error) => {
    //   console.error('Error reading CSV file:', error);
    //   sequelize.close();
    // });
  } catch (error) {
    console.error('Error seeding data:', error);
    await sequelize.close();
  }
};

module.exports = loadData;
