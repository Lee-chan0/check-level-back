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


userRouter.post('/auth/expired', async (req, res) => {
  const { authorization } = req.headers;
  try {
    if (!authorization) return res.status(401).json({ message: "토큰이 존재하지 않습니다." });

    const [tokenType, token] = authorization.split(' ');
    if (tokenType !== 'Bearer') return res.status(401).json({ message: "토큰 타입이 일치하지 않습니다." });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    return res.status(201).json({ message: "유효한 토큰 입니다.", decoded: decoded });

  } catch (e) {
    console.error(e);
    if (e.name === 'TokenExpiredError') {
      return res.status(403).json({ message: "유효하지 않은 토큰입니다. 다시 로그인해 주세요." });
    } else if (e.name === 'JsonWebTokenError') {
      return res.status(402).json({ message: "이상감지. 자동으로 로그아웃 됩니다." });
    }
    return res.status(500).json('Server Error');
  }
})

export default userRouter;