import express from 'express';
import dotenv from 'dotenv';
import adminRouter from './routes/adminRouter.js';
import articleRouter from './routes/articleRouter.js';
import categoryRouter from './routes/categoryRouter.js';
import cors from 'cors';
dotenv.config();
const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api', [adminRouter, articleRouter, categoryRouter]);

app.get('/', (req, res) => {
  res.send('Hello Express');
});

app.listen(PORT, () => {
  console.log('Server OPEN');
});