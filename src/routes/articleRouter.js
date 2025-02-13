import express from 'express';
import prisma from '../utils/prismaClinet.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { upload, s3 } from '../utils/fileUploader.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const articleRouter = express.Router();

articleRouter.get('/videoArticles/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const findVideo = await prisma.articles.findFirst({
      where: { articleId: +articleId },
      include: {
        User: {
          select: {
            userId: true,
            userNamePosition: true,
          }
        },
        Category: {
          select: {
            categoryId: true,
            categoryName: true,
          }
        },
      }
    })

    if (!findVideo) return res.status(401).json({ message: "해당하는 기사가 없습니다." });

    return res.status(201).json({ videoArticle: findVideo });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

articleRouter.get('/articles/category-list/:categoryId', async (req, res) => {
  try {
    const { pageParam, limit } = req.query;
    const { categoryId } = req.params;
    const skip = +pageParam * +limit;

    const findManyArticles = await prisma.articles.findMany({
      where: {
        articleType: {
          not: '동영상'
        },
        Category: {
          categoryId: +categoryId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        User: {
          select: {
            userId: true,
            userNamePosition: true,
          }
        },
        Category: {
          select: {
            categoryId: true,
            categoryName: true
          }
        }
      },
      skip: skip,
      take: +limit
    });

    const totalArticleCount = await prisma.articles.count({
      where: {
        articleType: {
          not: "동영상"
        },
        Category: {
          categoryId: +categoryId
        }
      }
    })

    const hasMore = totalArticleCount > skip + findManyArticles.length;

    return res.status(201).json({ articles: findManyArticles, hasMore });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

articleRouter.get('/videoArticles', async (req, res) => {
  try {
    const findVideos = await prisma.articles.findMany({
      where: { articleType: "동영상" },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        User: {
          select: {
            userId: true,
            userNamePosition: true,
          }
        },
        Category: {
          select: {
            categoryId: true,
            categoryName: true,
          }
        }
      },
    })

    return res.status(201).json({ videoArticles: findVideos });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

articleRouter.get('/articles/videos', async (req, res) => {
  try {
    const findAllArticles = await prisma.articles.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        User: {
          select: {
            userId: true,
            userNamePosition: true,
          }
        },
        Category: {
          select: {
            categoryId: true,
            categoryName: true,
          }
        }
      }
    })

    return res.status(201).json({ articles: findAllArticles });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

articleRouter.get('/articles/pageNation', async (req, res) => {
  try {
    const { pageParam, limit } = req.query;
    const skip = +pageParam * +limit;

    const articles = await prisma.articles.findMany({
      where: {
        articleType: {
          not: "동영상"
        }
      },
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
      },
      take: +limit,
      skip: skip
    });

    const totalArticleCount = await prisma.articles.count({
      where: {
        articleType: {
          not: '동영상'
        }
      }
    });

    const hasMore = +skip + articles.length < totalArticleCount;

    return res.status(201).json({ articles: articles, hasMore });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

articleRouter.get('/articles/page-videos', async (req, res) => {
  try {
    const { pageParam, limit } = req.query;
    const skip = +pageParam * +limit;

    const findPageVideos = await prisma.articles.findMany({
      where: {
        articleType: {
          equals: '동영상',
        }
      },
      include: {
        User: {
          select: {
            userId: true,
            userNamePosition: true,
          }
        },
        Category: {
          select: {
            categoryId: true,
            categoryName: true,
          }
        }
      },
      take: +limit,
      skip: skip
    });

    if (!findPageVideos) return res.status(401).json({ message: "동영상이 존재하지 않습니다." });

    const totalCount = await prisma.articles.count({ where: { articleType: '동영상' } });

    const hasMore = totalCount > findPageVideos.length + skip;

    return res.status(201).json({ videoArticles: findPageVideos, hasMore });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})


articleRouter.get('/articles', async (req, res) => {
  try {
    const articles = await prisma.articles.findMany({
      where: {
        articleType: {
          not: "동영상"
        }
      },
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
      },
    });

    return res.status(201).json({ articles: articles });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

articleRouter.get("/article/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;
    const findArticle = await prisma.articles.findFirst({
      where: { articleId: +articleId },
      include: {
        Category: {
          select: {
            categoryId: true,
            categoryName: true
          }
        }
      }
    })
    if (!findArticle) return res.status(401).json({ message: "게시물이 존재하지 않습니다." });

    return res.status(201).json({ article: findArticle });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
});

articleRouter.delete("/article/:articleId", authMiddleware, async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user;
    const findArticle = await prisma.articles.findFirst({
      where: {
        articleId: +articleId
      }
    });
    if (!findArticle) return res.status(401).json({ message: "해당하는 기사가 없습니다." });

    const findUser = await prisma.users.findFirst({ where: { userId: +userId } });
    if (!findUser) return res.status(401).json({ message: "해당하는 유저가 없습니다." });


    if (findArticle.UserId !== +userId) return res.status(403).json({ message: "삭제할 수 있는 권한이 없습니다." });

    await prisma.articles.delete({ where: { articleId: +articleId, UserId: +userId } });

    return res.status(200).json({ message: "기사가 삭제되었습니다." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

articleRouter.patch("/article/:articleId", upload.array("updateFiles"), authMiddleware, async (req, res) => {
  try {
    const userId = req.user;
    const { articleId } = req.params;
    const files = req.files;

    let { changeIndex } = req.body;
    const { articleTitle, articleSubTitle,
      articleContent, articleType, categoryName } = req.body;

    if (articleType !== '동영상') {
      if (!articleTitle || !articleContent ||
        !articleType || !categoryName || !articleSubTitle
      ) return res.status(401).json({ message: "빈칸없이 기재해주세요." });
    }


    const findUser = await prisma.users.findFirst({ where: { userId: +userId } });
    if (!findUser) return res.status(401).json({ message: "해당하는 유저가 없습니다." });

    const findArticle = await prisma.articles.findFirst({ where: { articleId: +articleId } });
    if (!findArticle) return res.status(401).json({ message: "존재하지 않는 기사입니다." });

    const findCategory = await prisma.categories.findFirst({ where: { categoryName: categoryName } });
    if (!findCategory) {
      await prisma.categories.create({
        data: {
          categoryName: categoryName
        }
      })
    }

    const getVideoId = (url) => {
      if (url.includes("youtube.com/shorts/")) {
        const parts = url.split("/shorts/");
        return parts[1];
      } else if (url.includes("v=")) {
        const queryParams = url.split("?")[1].split("&");
        for (let param of queryParams) {
          if (param.startsWith("v=")) {
            return param.slice(2);
          }
        }
      }
      return null; // 비디오 ID를 찾지 못한 경우
    };

    if (articleType === '동영상') {
      const isTrue = getVideoId(articleContent);
      if (!isTrue) {
        return res.status(401).json({ message: "유튜브 링크만 유효합니다." });
      }
    }

    if (articleType === '동영상') {

      await prisma.articles.update({
        where: { articleId: +articleId },
        data: {
          articleTitle: articleTitle,
          articleContent: articleContent,
          CategoryId: findCategory.categoryId,
          UserId: userId
        }
      })

      return res.status(201).json({ message: "수정이 완료되었습니다." });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (!Array.isArray(changeIndex)) {
      changeIndex = [changeIndex];
    }

    const currentImages = JSON.parse(findArticle.articleImageUrls);
    let newUploadUrls = uploadUrls.map((item) => item);

    for (let i = 0; i < changeIndex.length; i++) {
      const idx = +changeIndex[i];
      currentImages[idx] = uploadUrls[i];
      newUploadUrls = newUploadUrls.filter((item) => item !== uploadUrls[i]);
    }

    newUploadUrls.forEach((item) => (currentImages.push(item)));

    const updateArticle = await prisma.articles.update({
      where: { articleId: +articleId },
      data: {
        articleTitle: articleTitle,
        articleSubTitle: articleSubTitle,
        articleContent: articleContent,
        articleType: articleType,
        articleImageUrls: JSON.stringify(currentImages),
        CategoryId: +findCategory.categoryId,
        UserId: +userId
      }
    })

    return res.status(201).json({ updatedArticle: updateArticle });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

articleRouter.post("/article", upload.array("files"), authMiddleware, async (req, res) => {
  try {
    const userId = req.user;
    const files = req.files;
    const { articleTitle, articleSubTitle,
      articleContent, articleType, categoryName } = req.body;

    if (!articleTitle || !articleContent ||
      !articleType || !categoryName || !articleSubTitle
    ) {
      return res.status(401).json({ message: "빈칸없이 기재해주세요." });
    }

    const getVideoId = (url) => {
      if (url.includes("youtube.com/shorts/")) {
        const parts = url.split("/shorts/");
        return parts[1];
      } else if (url.includes("v=")) {
        const queryParams = url.split("?")[1].split("&");
        for (let param of queryParams) {
          if (param.startsWith("v=")) {
            return param.slice(2);
          }
        }
      }
      return null; // 비디오 ID를 찾지 못한 경우
    };

    if (articleType === '동영상') {
      const isTrue = getVideoId(articleContent);
      if (!isTrue) {
        return res.status(401).json({ message: "유튜브 링크만 유효합니다." });
      }
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

articleRouter.get('/articles/today', async (req, res) => {
  try {
    const { limit } = req.query;
    const findTodayArticle = await prisma.articles.findMany({
      where: {
        articleType: {
          not: "동영상"
        }
      },
      include: {
        Category: {
          select: {
            categoryId: true,
            categoryName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: +limit,
    })

    if (!findTodayArticle) return res.status(401).json({ message: "no result" });

    return res.status(201).json({ todayArticle: findTodayArticle })
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
});

articleRouter.get('/articles/top', async (req, res) => {
  try {
    const { limit } = req.query;
    const findTopArticles = await prisma.articles.findMany({
      where: {
        articleType: {
          not: "동영상"
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: +limit
    })

    if (!findTopArticles) return res.status(401).json({ message: "no result" });

    return res.status(201).json({ topArticles: findTopArticles });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

articleRouter.patch('/important/article', authMiddleware, async (req, res) => {
  try {
    const { articleId, isActiveStar } = req.body;


    const findArticle = await prisma.articles.findFirst({ where: { articleId: +articleId } });
    if (!findArticle) return res.status(401).json({ message: "존재하지 않는 기사입니다." });

    if (isActiveStar === true) {
      const updateImportantStar = await prisma.articles.update({
        where: { articleId: +articleId },
        data: {
          isImportant: true
        }
      })

      return res.status(201).json({ updateStar: updateImportantStar })
    } else {
      const updateImportantStar = await prisma.articles.update({
        where: { articleId: +articleId },
        data: {
          isImportant: false
        }
      })

      return res.status(201).json({ updateStar: updateImportantStar })
    }

  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

articleRouter.get('/important/articles', authMiddleware, async (req, res) => {
  try {
    const findImportantArticles = await prisma.articles.findMany({
      where: {
        isImportant: {
          not: false
        }
      }, orderBy: {
        createdAt: 'desc'
      },
      include: {
        User: {
          select: {
            userId: true,
            userNamePosition: true,
          }
        },
        Category: {
          select: {
            categoryId: true,
            categoryName: true
          }
        }
      }
    })

    return res.status(201).json({ importantArticles: findImportantArticles })
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

articleRouter.get('/myArticles', authMiddleware, async (req, res) => {
  try {
    const userId = req.user;

    const findMyArticles = await prisma.articles.findMany({
      where:
      {
        UserId: +userId
      },
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

    if (!findMyArticles) return res.status(401).json({ message: "작성한 기사가 존재하지 않습니다." });

    return res.status(201).json({ findMyArticles: findMyArticles });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

export default articleRouter;