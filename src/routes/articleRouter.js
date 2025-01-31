import express from 'express';
import prisma from '../utils/prismaClinet.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { upload, s3 } from '../utils/fileUploader.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const articleRouter = express.Router();


articleRouter.get('/articles', async (req, res) => {
  try {
    console.log(req.ip);
    const findAllArticle = await prisma.articles.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        User: {
          select: {
            userId: true,
            userNamePosition: true
          }
        },
        Category: {
          select: {
            categoryId: true,
            categoryName: true,
          }
        }
      }
    });
    return res.status(201).json({ articles: findAllArticle });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})



articleRouter.get("/article/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;
    const findArticle = await prisma.articles.findFirst({
      where: { articleId: articleId }
    })
    if (!findArticle) return res.status(401).json({ message: "게시물이 존재하지 않습니다." });

    return res.status(201).json({ article: findArticle });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
});


articleRouter.post("/article", upload.array("files"), authMiddleware, async (req, res) => {
  try {
    const userId = req.user;
    const files = req.files;
    const { articleTitle, articleSubTitle,
      articleContent, articleType, categoryName } = req.body;

    if (!articleTitle || !articleSubTitle || !articleContent ||
      !articleType || !categoryName
    ) {
      return res.status(401).json({ message: "전부 입력해주세요." });
    }
    ////////////////////////////////////////////////////////////////////////////

    // S3에 직접 업로드
    const uploadPromises = files.map(async (file) => {
      const fileExt = path.extname(file.originalname).toLowerCase(); // 확장자 유지
      const fileKey = `uploads/${Date.now()}_${uuidv4()}${fileExt}`; // ✅ 한글 파일명 제거, 안전한 이름 사용

      const uploadParams = {
        Bucket: "my-bucket-test",
        Key: fileKey,
        Body: file.buffer,
        ACL: "public-read",
        ContentType: file.mimetype
      };

      await s3.send(new PutObjectCommand(uploadParams));
      return `https://kr.object.ncloudstorage.com/my-bucket-test/${fileKey}`;
    });

    const uploadUrls = await Promise.all(uploadPromises);

    ////////////////////////////////////////////////////////////////////////////
    let findCategory = await prisma.categories.findFirst({
      where: { categoryName }
    });

    if (!findCategory) {
      findCategory = await prisma.categories.create({
        data: { categoryName }
      });
    }

    // 데이터베이스에 저장
    const createArticle = await prisma.articles.create({
      data: {
        articleType,
        articleTitle,
        articleSubTitle,
        articleContent,
        articleImageUrls: JSON.stringify(uploadUrls),
        CategoryId: findCategory.categoryId,
        UserId: userId
      }
    });

    return res.status(201).json({ article: createArticle });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
});


export default articleRouter;
