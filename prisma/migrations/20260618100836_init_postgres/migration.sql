-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initial" TEXT NOT NULL,
    "avatarGradient" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "ratio" TEXT NOT NULL,
    "thumbnailGradient" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
