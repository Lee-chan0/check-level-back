import express from 'express';
import postListRouter from './routes/postListRouter.js';
import userRouter from './routes/userRouter.js';
import commentRouter from './routes/commentRouter.js';
import morgan from 'morgan';
import cors from 'cors';


const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use('/api', [postListRouter, userRouter, commentRouter]);


app.get('/', (req, res) => {
  res.send('Welcome express');
});

app.listen(PORT, () => {
  console.log('SERVER OPEN');
});