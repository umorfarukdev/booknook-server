import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import { createRemoteJWKSet, jwtVerify } from "jose";

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
const borrowsCollection = db?.collection("borrows");

// Middlewares
app.use(cors());
app.use(express.json());

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "Invalid token" });
  }

  const jwks = createRemoteJWKSet(
    new URL("http://localhost:3000/api/auth/jwks"),
  );

  try {
    const { payload } = await jwtVerify(token, jwks);
    next();
  } catch (err) {
    return res.status(401).send({ message: "server error" });
  }
};

app.get("/newest-books", async (req: Request, res: Response) => {
  const result = await booksCollection
    ?.find()
    .sort({ date: -1 })
    .limit(6)
    .toArray();
  res.send(result);
});

app.get("/books", async (req: Request, res: Response) => {
  const result = await booksCollection?.find().toArray();
  res.send(result);
});

app.get("/books/:email", async (req: Request, res: Response) => {
  const email = req.params.email;
  const query = { userEmail: email as string };
  const result = await booksCollection?.find(query).toArray();
  res.json(result);
});

app.get("/book/:id", verifyToken, async (req: Request, res: Response) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id as string) };
  const result = await booksCollection?.findOne(query);
  res.send(result);
});

app.post("/books", async (req: Request, res: Response) => {
  const books = req.body;
  const result = await booksCollection?.insertOne(books);
  res.send(result);
});

app.patch("/books/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedBook = req.body;
  const filter = { _id: new ObjectId(id as string) };
  const options = { upsert: true };
  const updateDoc = {
    $set: updatedBook,
  };
  const result = await booksCollection?.updateOne(filter, updateDoc, options);
  res.send(result);
});

app.delete("/books/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id as string) };
  const result = await booksCollection?.deleteOne(query);
  res.send(result);
});

app.get("/borrows/:email", async (req: Request, res: Response) => {
  const email = req.params.email;
  const query = { userEmail: email as string };
  const result = await borrowsCollection?.find(query).toArray();
  res.send(result);
});

app.post("/borrows", async (req: Request, res: Response) => {
  const data = req.body;
  const result = await borrowsCollection?.insertOne(data);
  res.send(result);
});

app.delete("/borrows/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const query = { _id: id as string };
  const result = await borrowsCollection?.deleteOne(query as any);
  res.send(result);
});

app.listen(port, () => {
  console.log(`BookNook server is running on port ${port}`);
});
