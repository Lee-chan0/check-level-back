import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prismaClient.js';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const upload = multer();

const userRouter = express();

userRouter.post('/signup', upload.none(), async (req, res) => {
  try {
    const { email, password, nickname, role } = req.body;
    const findUser = await prisma.user.findFirst({
      where: {
        email: email,
      }
    });

    if (findUser) return res.status(401).json({ message: "이미 존재하는 이메일 입니다." });

    const SALT_COUNT = 10;

    const encryptionPassword = await bcrypt.hash(password, SALT_COUNT);

    const createUser = await prisma.user.create({
      data: {
        email: email,
        password: encryptionPassword,
        nickname: nickname,
        role: role
      }
    })

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
});


userRouter.post('/signin', upload.none(), async (req, res) => {
  try {
    const { email, password } = req.body;
    const SECRET_KEY = process.env.SECRET_KEY;

    const findUser = await prisma.user.findFirst({
      where: {
        email: email,
      }
    });

    if (!findUser) return res.status(401).json({ message: "존재하지 않는 email입니다." });

    const result = await bcrypt.compare(password, findUser.password);
    if (!result) return res.status(401).json({ message: "비밀번호를 확인하세요." });

    const jwtToken = jwt.sign({ userId: findUser.userId }, SECRET_KEY, { expiresIn: '30s' });

    return res.status(200).json({ message: `환영합니다. ${findUser.nickname}님`, token: `Bearer ${jwtToken}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
});



export default userRouter;