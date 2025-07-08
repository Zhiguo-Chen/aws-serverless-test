import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import sequelize from '../models/index.js';
import { Category } from '../models';

const seedCategories = async () => {
  try {
    const results: any[] = [];
    const filePath = path.join(__dirname, 'categories.csv');

    // Read CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log('CSV file successfully processed');

        // Sync database
        await sequelize.sync();

        // Clear existing categories
        await Category.destroy({ truncate: true });

        // Insert new categories
        await Category.bulkCreate(results);

        console.log(`${results.length} categories seeded successfully`);
        process.exit(0);
      });
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();