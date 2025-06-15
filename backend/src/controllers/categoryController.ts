import db, { Category } from '../models';
import { Request, Response } from 'express';

export const listAllCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findAll();
    return res.status(200).json(category);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'slug', 'imageUrl'],
    });
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
