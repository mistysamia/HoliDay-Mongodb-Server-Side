const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ljzsa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('holyday');
        const productCollection = database.collection('packages');
        const orderCollection = database.collection('orders');
        const packageRequest = database.collection('packageRequest');

        //GET packages API
        app.get('/packages', async (req, res) => {
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let packages;
            const count = await cursor.count();

            if (page) {
                packages = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                packages = await cursor.toArray();
            }

            res.send({
                count,
                packages
            });
        });

        //GET packages API
        app.get('/orderrequest', async (req, res) => {
            const cursor = packageRequest.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let orderrequest;
            const count = await cursor.count();

            if (page) {
                orderrequest = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                orderrequest = await cursor.toArray();
            }

            res.send({
                count,
                orderrequest
            });
        });

        //GET allaOrderDisplay API
        app.get('/allorderdisplay', async (req, res) => {
            const cursor = orderCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let allOrderDisplay;
            const count = await cursor.count();

            if (page) {
                allOrderDisplay = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                allOrderDisplay = await cursor.toArray();
            }

            res.send({
                count,
                allOrderDisplay
            });
        });


        // Use POST to get data by keys
        app.post('/packages/byKeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const packages = await productCollection.find(query).toArray();
            res.send(packages);
        });

        // Add Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
            const result1 = await packageRequest.deleteOne({ "userId": order.userId });
            res.json(result1);
        })

        // Add Delete Orders Req API
        app.post('/deleteordersreq', async (req, res) => {
            const order = req.body;
            const result = await packageRequest.deleteOne({ "userId": order.userId });
            res.json(result);
        })

        // Add Delete Orders API
        app.post('/deleteorders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.deleteOne({ "userId": order.userId });
            res.json(result);
        })

        // Add new Package API
        app.post('/addnewpackage', async (req, res) => {
            const order = req.body;
            const result = await productCollection.insertOne(order);
            res.json(result);
        })


        // Add Request Orders API
        app.post('/packagerequest', async (req, res) => {
            const request = req.body;
            const newOrder = await packageRequest.insertOne(request);
            res.json(newOrder);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('holyday start');
});
app.get('/holyday', (req, res) => {
    res.send('holyday start is running by MISTY');
});

app.listen(port, () => {
    console.log('Server running at port', port);

})