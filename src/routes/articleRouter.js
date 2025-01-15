import express from 'express';
import prisma from '../utils/prismaClinet.js';
import multer from 'multer';
import { articleTypeSchema, categorySchema } from '../Validation/joi.js';

const articleRouter = express.Router();

const upload = multer();


articleRouter.post('/article', async (req, res) => {
  try {
    const articleTypeValidate = await articleTypeSchema.validateAsync(req.body);
    const categoryValidate = await categorySchema.validateAsync(req.body);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
});


export default articleRouter;