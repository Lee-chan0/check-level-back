-- CreateTable
CREATE TABLE "Post" (
    "postId" SERIAL NOT NULL,
    "postTitle" TEXT NOT NULL,
    "postContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("postId")
);
