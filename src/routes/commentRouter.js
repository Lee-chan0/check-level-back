import express, { response } from 'express';
import prisma from '../utils/prismaClient.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const commentRouter = express();

commentRouter.get('/post/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;

    const findSelectedPost = await prisma.post.findFirst({ where: { postId: +postId } });
    if (!findSelectedPost) return res.status(401).json({ message: "해당하는 게시글을 찾을 수 없습니다." });

    const postComments = await prisma.comment.findMany({
      where: { postId: +postId },
      include: {
        user: {
          select: {
            nickname: true
          }
        }
      }
    });

    return res.status(200).json({ commentsData: postComments });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server Error" });
  }
});


commentRouter.post('/post/:postId/comment', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;
    const { commentContent } = req.body;

    const createComment = await prisma.comment.create({
      data: {
        userId: userId,
        postId: +postId,
        commentContent: commentContent,
      },
      include: {
        user: {
          select: {
            nickname: true
          }
        }
      }
    });

    return res.status(201).json({ commentsData: createComment });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server Error" });
  }
});

commentRouter.patch('/post/:postId/comment/:commentId', authMiddleware, async (req, res) => {
  const { userId } = req.user;
  const { postId, commentId } = req.params;
  const { commentContent } = req.body;

  const findPost = await prisma.post.findUnique({ where: { postId: +postId } });
  if (!findPost) return res.status(401).json({ message: "해당하는 게시물을 찾을 수 없습니다." });

  const findComment = await prisma.comment.findUnique({ where: { commentId: +commentId } });
  if (findComment.userId !== userId) return res.status(403).json({ message: "댓글을 수정할 수 있는 권한이 없습니다." });

  const editComment = await prisma.comment.update({
    where: { commentId: +commentId },
    data: {
      commentContent: commentContent
    }
  });

  return res.status(201).json({ message: "댓글이 수정되었습니다.", commentData: editComment });
});

commentRouter.delete('/post/:postId/comment/:commentId', authMiddleware, async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.user;

  const findPost = await prisma.post.findUnique({ where: { postId: +postId } });
  if (!findPost) return res.status(401).json({ message: "해당하는 게시글을 찾을 수 없습니다." });

  const findComment = await prisma.comment.findUnique({ where: { commentId: +commentId } });
  if (!findComment) return res.status(401).json({ message: "해당하는 댓글을 찾을 수 없습니다." });

  if (findComment.userId !== userId) return res.status(403).json({ message: "댓글을 삭제할 수 있는 권한이 없습니다." });

  const deleteComment = await prisma.comment.delete({ where: { commentId: +commentId } });

  return res.status(201).json({ message: "댓글이 삭제되었습니다." });
});



export default commentRouter;