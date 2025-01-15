import express from 'express';
import { adminSignUpSchema, adminSignInSchema } from '../Validation/joi.js';
import prisma from '../utils/prismaClinet.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';

dotenv.config();

const adminRouter = express.Router();
const upload = multer();

adminRouter.post('/signup', upload.none(), async (req, res) => {
  try {
    const validation = await adminSignUpSchema.validateAsync(req.body);
    const { adminLoginId, adminPassword, adminName } = validation;

    if (!adminLoginId || !adminPassword) return res.status(401).json({ message: "잘못된 입력입니다." });

    const existAdmin = await prisma.admin.findUnique({
      where: { adminLoginId: adminLoginId }
    })

    if (existAdmin) return res.status(401).json({ message: "중복된 ID입니다." });

    const encryptAdminPassword = await bcrypt.hash(adminPassword, 10);

    const createAdmin = await prisma.admin.create({
      data: {
        adminLoginId: adminLoginId,
        adminPassword: encryptAdminPassword,
        adminName: adminName
      }
    });

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
});

adminRouter.post('/signin', upload.none(), async (req, res) => {
  try {
    const validation = await adminSignInSchema.validateAsync(req.body);
    const { adminLoginId, adminPassword } = validation;

    const existAdmin = await prisma.admin.findUnique({
      where: {
        adminLoginId: adminLoginId,
      }
    });

    if (!existAdmin) return res.status(403).json({ message: "존재하지 않는 유저입니다." });

    const decodedPassword = await bcrypt.compare(adminPassword, existAdmin.adminPassword);
    if (!decodedPassword) return res.status(403).json({ message: "잘못된 비밀번호 입니다.." });

    const token = jwt.sign({ adminId: existAdmin.adminId }, process.env.SECRET_KEY, { expiresIn: '30m' });

    return res.status(201).json({ token: token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
});


export default adminRouter;