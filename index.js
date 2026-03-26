require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// instance
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.oko4eb5.mongodb.net/?appName=Cluster1`;
// console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log('db connected successfully');
    // Get the database and collection on which to run the operation
    const database = client.db('jobsPortalDB2');
    const jobsCollection = database.collection('jobsColl');
    const applicationsCollection = database.collection('appsColl');
    //=====================================================

    //all jobs read opreation
    app.get('/jobs', async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //one job read opreation
    app.get('/jobs/:id', async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    //some applications read opreation
    app.get('/applications', async (req, res) => {
      const query = { applicant_email: req.query.email };
      const cursor = applicationsCollection.find(query);
      const result = await cursor.toArray();

      // aggregate data
      for (const item of result) {
        console.log(item.job_id);
        const queryAgain = { _id: new ObjectId(item.job_id) };
        const resultAgain = await jobsCollection.findOne(queryAgain);

        if (resultAgain) {
          item.title = resultAgain.title;
          item.company = resultAgain.company;
          item.company_logo = resultAgain.company_logo;
          item.location = resultAgain.location;
          item.jobType = resultAgain.jobType;
        }
      }

      res.send(result);
    });

    //one application create opreation
    app.post('/applications', async (req, res) => {
      const doc = req.body;
      const result = await applicationsCollection.insertOne(doc);
      res.send(result);
    });

    //=====================================================
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } catch (error) {
    console.log(error);
  }
}
run();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
