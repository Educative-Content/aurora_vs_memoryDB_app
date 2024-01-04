const { Cluster } = require('ioredis');
const faker = require('faker');

const nodes = [
  {
    port: 6379,
    host: process.env.MEMORYDB_ENDPOINT,
  },
];

const redis = new Cluster(nodes);

async function populateMemoryDB() {
  try {
    for (let i = 1; i <= 500; i++) {
      const entry = {
        show_id: i,
        type: faker.random.arrayElement(['Movie', 'TV Show']),
        title: faker.lorem.words(3),
        director: faker.name.findName(),
        country: faker.address.country(),
        date_added: faker.date.past().toISOString().split('T')[0],
        release_year: faker.datatype.number({ min: 1900, max: 2023 }),
        rating: faker.random.arrayElement(['G', 'PG', 'PG-13', 'R']),
        duration: `${faker.datatype.number(200)} min`,
        listed_in: faker.random.words(3),
      };

      await redis.set(`netflix:${i}`, JSON.stringify(entry));
    }
    console.log('Entries added to MemoryDB for Redis.');
  } catch (error) {
    console.error('Error populating MemoryDB:', error);
  }
}

populateMemoryDB();
