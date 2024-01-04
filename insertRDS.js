const express = require('express');
const faker = require('faker');
const mysql = require('mysql');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.static(__dirname));

app.use(cors());
// const myVariable = process.env.ENDPOINT_OF_WRITER_INSTANCE;

const db = mysql.createConnection({
  host: process.env.ENDPOINT_OF_WRITER_INSTANCE,
  user: 'admin',
  password: 'educative123',
  database: 'educative_db',
});

db.connect((err) => {
  if (err) throw err;

  console.log('DB connected successfully!');
  // Generate and execute INSERT statements for 500 rows
  for (let i = 1; i <= 500; i++) {
    const type = Math.random() < 0.5 ? 'Movie' : 'TV Show';
    const title = faker.lorem.words();
    const director = faker.name.findName();
    const country = faker.address.country();
    const dateAdded = faker.date.past().toISOString().split('T')[0];
    const releaseYear = faker.datatype.number({ min: 1920, max: 2023 });
    const rating = faker.random.arrayElement([
      'G',
      'PG',
      'PG-13',
      'R',
      'NC-17',
    ]);
    const duration = `${faker.datatype.number({ min: 60, max: 240 })} min`;
    const listedIn = faker.random.words();

    const sql = `INSERT INTO netflix (show_id, type, title, director, country, date_added, release_year, rating, duration, listed_in) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [
        i,
        type,
        title,
        director,
        country,
        dateAdded,
        releaseYear,
        rating,
        duration,
        listedIn,
      ],
      (err, result) => {
        if (err) throw err;
        console.log(`Inserted row ${i}`);
      }
    );
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
