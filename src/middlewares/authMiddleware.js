import jwt from 'jsonwebtoken';
import express from 'express';
import dotenv from 'dotenv';
import prisma from '../utils/prismaClient.js';

dotenv.config();

export async function authMiddleware(req, res, next) {
  try {
    const SECRET_KEY = process.env.SECRET_KEY;
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).json({ message: "토큰이 존재하지 않습니다." });
    const [tokenType, token] = authorization.split(' ');

    if (tokenType !== 'Bearer') return res.status(401).json({ message: "토큰 타입이 일치하지 않습니다." });

    const tokenVerfy = jwt.verify(token, SECRET_KEY);

    const userId = tokenVerfy.userId;

    const findUser = await prisma.user.findFirst({ where: { userId: userId } });
    if (!findUser) return res.status(401).json({ message: "존재하지 않는 사용자 입니다." });

    req.user = findUser;

    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
}