const express = require('express');
const { Product, ProductInfo, Type } = require('../models/models');
const ApiError = require('../error/ApiError');

class CatalogController {
    // Вывод всех товаров
    async getAllProducts(req, res) {
        let { typeId, limit, page } = req.query;
        page = page || 1;
        limit = limit || 9;
        let offset = page * limit - limit;
        let products;

        if (!typeId) {
            products = await Product.findAndCountAll({ limit, offset });
        } else {
            products = await Product.findAndCountAll({ where: { typeId }, limit, offset });
        }

        return res.json(products);
    }

    // Вывод одного товара
    async getOneProduct(req, res) {
      const { id } = req.params;
      try {
        const product = await Product.findOne({
          where: { id },
          include: [{ model: ProductInfo, as: 'info' }],
        });
    
        if (!product) {
          return res.status(404).json({ error: 'Товар не найден' });
        }
    
        const { direction, price, img, info } = product;
    
        // Извлекаем данные описание из массива info
        const descriptions = info.map(item => ({
          title: item.title,
          description: item.description
        }));
    
        const fullProductInfo = {
          id,
          direction,
          price,
          img,
          info: descriptions // Здесь передаем массив описаний
        };
    
        return res.json(fullProductInfo);
      } catch (error) {
        console.error('Ошибка при запросе к базе данных:', error);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
      }
    }

    // Вывод всех типов товаров
    async getAllTypes(req, res) {
        try {
            const types = await Type.findAll();
            return res.json(types);
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
   module.exports = new CatalogController();