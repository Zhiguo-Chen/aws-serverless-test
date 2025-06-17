// seeders/seedProducts.js
// const fs = require('fs');
// const path = require('path');
// const csv = require('csv-parser');
// const sequelize = require('../config/database');
import fs from 'fs';
import path from 'path';
// @ts-ignore
import csv from 'csv-parser';
import sequelize from '../config/database';

export const loadData = async (Model: any, fileName: string) => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Sync the model
    await sequelize.sync();

    // Read the CSV file
    const results: Record<string, any>[] = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.resolve(__dirname + '/../db/data/', fileName))
        .pipe(csv())
        .on('data', (data: any) => results.push(data))
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
  } catch (error) {
    console.error('Error seeding data:', error);
    await sequelize.close();
  }
};
