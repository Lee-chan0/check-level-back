-- CreateTable
CREATE TABLE "User" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "password" TEXT NOT NULL,
    "userNamePosition" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "categoryId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Article" (
    "articleId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleType" TEXT NOT NULL,
    "articleTitle" TEXT NOT NULL,
    "articleContent" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "UserId" INTEGER NOT NULL,
    "CategoryId" INTEGER NOT NULL,
    CONSTRAINT "Article_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Article_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "Category" ("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArticleImages" (
    "articleImageId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleImageUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ArticleId" INTEGER NOT NULL,
    CONSTRAINT "ArticleImages_ArticleId_fkey" FOREIGN KEY ("ArticleId") REFERENCES "Article" ("articleId") ON DELETE RESTRICT ON UPDATE CASCADE
);
