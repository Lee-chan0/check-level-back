import express from 'express';
import prisma from '../utils/prismaClient.js';
import multer from 'multer';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import imageUploader from '../middlewares/imageMiddleware.js';

const postListRouter = express();

const upload = multer();

postListRouter.get('/post', async (req, res) => {
  try {
    const findPostAll = await prisma.post.findMany({
      include: {
        user: {
          select: {
            nickname: true
          }
        }
      }
    });

    return res.status(200).json({ postsData: findPostAll });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
})

postListRouter.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const findPost = await prisma.post.findFirst({
      where: { postId: +postId },
      include: {
        user: {
          select: {
            nickname: true
          }
        }
      }
    })
    if (!findPost) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    return res.status(200).json({ postData: findPost });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
})

postListRouter.post('/post', authMiddleware, upload.none(), imageUploader.single('image'), async (req, res) => {
  try {
    const { postTitle, postContent } = req.body;
    const { userId } = req.user;
    const filePath = req.file.location;
    console.log(filePath);
    if (!filePath) {
      throw new Error({
        status: 401,
        response: {
          message: "invalid-file-path"
        }
      })
    }

    const createPost = await prisma.post.create({
      data: {
        postTitle: postTitle,
        postContent: postContent,
        userId: userId,
      }
    });
    return res.status(201).json({ message: "게시글이 등록 되었습니다.", postData: createPost });
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

    const findPost = await prisma.post.findFirst({ where: { postId: +postId } });
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
    return res.status(201).json({ message: "게시글 수정 완료", postData: editPost });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
})

postListRouter.delete('/post/:postId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    const findPost = await prisma.post.findFirst({ where: { postId: +postId } });
    if (!findPost) return res.status(404).json({ message: "해당하는 게시글이 없습니다." });
    if (findPost.userId !== userId) return res.status(403).json({ message: "삭제할 수 있는 권한이 없습니다." });

    await prisma.post.delete({ where: { postId: +postId } });

    return res.status(200).json({ message: "게시글이 삭제되었습니다." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
});

export default postListRouter;