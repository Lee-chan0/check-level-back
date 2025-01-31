import express from 'express';
import prisma from '../utils/prismaClinet.js';


const categoryRouter = express.Router();

categoryRouter.get('/categories', async (req, res) => {
  try {
    const findCategories = await prisma.categories.findMany();

    return res.status(201).json({ categories: findCategories });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error" });
  }
})

export default categoryRouter;