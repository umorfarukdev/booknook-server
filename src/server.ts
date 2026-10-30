import express, { type Request, type Response } from 'express';
import cors from 'cors';
import "dotenv/config"

const port = process.env.PORT;

const app = express();


// Middlewares
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('BookNook server is running');
});


app.listen(port, () => {
    console.log(`BookNook server is running on port ${port}`); 
});