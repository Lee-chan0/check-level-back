import express from 'express';
import prisma from '../utils/prismaClient.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const postListRouter = express();

postListRouter.get('/post', async (req, res) => {
  try {
    const findPostAll = await prisma.post.findMany();

    return res.status(200).json({ data: findPostAll });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
})

postListRouter.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const findPost = await prisma.post.findFirst({ where: { postId: +postId } })
    if (!findPost) return res.status(401).json({ message: "게시글을 찾을 수 없습니다." });

    return res.status(200).json({ data: findPost });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
})

postListRouter.post('/post', authMiddleware, async (req, res) => {
  try {
    const { postTitle, postContent } = req.body;
    const { userId } = req.user;

    const createPost = await prisma.post.create({
      data: {
        postTitle: postTitle,
        postContent: postContent,
        userId: userId,
      }
    });
    return res.status(201).json({ message: "게시글이 등록 되었습니다.", data: createPost });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
})

postListRouter.patch('/post/:postId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;
    const { postTitle, postContent } = req.body;

    const findPost = await prisma.post.findFirst({ where: { postId: +postId, userId: userId } });
    if (findPost.userId !== userId) return res.status(403).json({ message: "게시글을 수정할 수 있는 권한이 없습니다." });

    const editPost = await prisma.post.update({
      where: {
        postId: +postId,
      },
      data: {
        postTitle: postTitle,
        postContent: postContent
      }
    })
    return res.status(201).json({ message: "게시글 수정 완료", data: editPost });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
})

postListRouter.delete('/post/:postId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    const findPost = await prisma.post.findFirst({ where: { userId: userId, postId: +postId } });
    if (!findPost) return res.status(401).json({ message: "해당하는 게시글이 없습니다." });

    await prisma.post.delete({ where: { userId: userId, postId: +postId } });

    return res.status(200).json({ message: "게시글이 삭제되었습니다." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
});

export default postListRouter;