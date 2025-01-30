import jwt from 'jsonwebtoken';
import express from 'express';
import prisma from '../utils/prismaClinet.js';
import dotenv from 'dotenv';

dotenv.config();

export default async function (req, res, next) {
  try {
    const { authorization } = req.headers;
    const key = process.env.SECRET_KEY;
    const [tokenType, token] = authorization.split(' ');

    if (tokenType !== 'Bearer') {
      return res.status(403).json({ message: "토큰 타입이 일치하지 않습니다." });
    }

    const verifyToken = jwt.verify(token, key);

    const { userId } = verifyToken;

    const findUser = await prisma.users.findFirst({
      where: { userId: userId }
    })

    if (!findUser) return res.status(401).json({ message: "존재하지 않는 유저입니다." });

    req.user = findUser.userId;

    next();
  } catch (e) {
    if (e.name === 'JsonWebTokenError') {
      console.error(e);
      return res.status(403).json({ message: "올바르지 않은 접근입니다." });
    } else if (e.name === 'TokenExpiredError') {
      console.error(e);
      return res.status(403).json({ message: "토큰이 만료되었습니다." });
    }
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
}