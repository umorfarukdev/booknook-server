import express, { type Request, type Response } from 'express';
import cors from 'cors';
import "dotenv/config"
import { MongoClient } from 'mongodb';

const port = process.env.PORT;

const app = express();
const client = new MongoClient(process.env.MONGODB_URI as string);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongoClient = await connectToMongoDB();
const db = mongoClient?.db("booknook");
const booksCollection = db?.collection("books");

// Middlewares
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('BookNook server is running');
});


app.listen(port, () => {
    console.log(`BookNook server is running on port ${port}`); 
});