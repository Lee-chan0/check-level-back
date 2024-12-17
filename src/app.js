import express from 'express';
import postListRouter from '../routes/postListRouter.js';
import userRouter from '../routes/userRouter.js';
import commentRouter from '../routes/commentRouter.js';


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', [postListRouter, userRouter, commentRouter]);


app.get('/', (req, res) => {
  res.send('Welcome express');
});

app.listen(PORT, () => {
  console.log('SERVER OPEN');
});