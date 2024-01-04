const express = require('express');
const { Cluster } = require('ioredis');
const mysql = require('mysql');
const path = require('path');
const cors = require('cors');

const nodes = [
  {
    port: 6379,
    host: process.env.MEMORYDB_ENDPOINT,
  },
];

const redis = new Cluster(nodes);

const app = express();
app.use(express.static(__dirname));

app.use(cors());

const db = mysql.createConnection({
  host: process.env.ENDPOINT_OF_WRITER_INSTANCE,
  user: 'admin',
  password: 'educative123',
  database: 'educative_db',
});

db.connect((err) => {
  if (err) throw err;

  console.log('DB connected successfully!');
});

app.get('/rdsquery', async (req, res) => {
  const queryCount = 500; // Number of queries
  let queryData = [];

  for (let index = 0; index < queryCount; index++) {
    let sql = `SELECT * FROM netflix`;
    var rdsTimeBeforeQuery = new Date().getTime();

    await new Promise((resolve, reject) => {
      db.query(sql, function (err, result, fields) {
        if (err) {
          reject(err);
        }
        var rdsTimeAfterQuery = new Date().getTime();
        let queryTime = rdsTimeAfterQuery - rdsTimeBeforeQuery;
        queryData.push({ queryNumber: index + 1, queryTime });
        resolve();
      });
    });
  }

  // Extracting the data for chart
  const labels = queryData.map((data) => data.queryNumber);
  const data = queryData.map((data) => data.queryTime);
  const sum = data.reduce((acc, curr) => acc + curr, 0);
  const average = sum / data.length;

  console.log('Average query execution time for RDS: ', average);

  // Sending data to the client for chart rendering
  res.send({ labels, data });
});

app.get('/memorydbquery', async (req, res) => {
  try {
    const numQueries = 500; // Number of queries to execute
    const labels = [];
    const data = [];

    for (let index = 0; index < numQueries; index++) {
      const redisTimeBeforeQuery = new Date().getTime();
      const cachedData = await redis.get(`netflix:${index + 1}`);
      const redisTimeAfterQuery = new Date().getTime();

      if (cachedData) {
        const queryTime = redisTimeAfterQuery - redisTimeBeforeQuery;
        labels.push(`Query ${index + 1}`);
        data.push(queryTime);
      }
    }
    const sum = data.reduce((acc, curr) => acc + curr, 0);
    const average = sum / data.length;

    console.log('Average query execution time for MemoryDB: ', average);

    res.send({ labels, data });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
