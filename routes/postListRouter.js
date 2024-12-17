import express from 'express';
import prisma from '../utils/prismaClient.js';


const postListRouter = express();


postListRouter.get('/post', async (req, res) => {
  const postList = await prisma.post.findMany();

  return res.status(200).json({ postList });
});

postListRouter.post('/post', async (req, res) => {
  const { postTitle, postContent } = req.body;

  const postResponse = await prisma.post.create({
    data: {
      postTitle: postTitle,
      postContent: postContent,
    }
  });

  return res.status(201).json({ postResponse });
});

postListRouter.get('/post/:postId', async (req, res) => {
  const { postId } = req.params;
  const findPost = await prisma.post.findUnique({
    where: {
      postId: +postId
    }
  });

  return res.status(200).json({ findPost });
})

export default postListRouter;