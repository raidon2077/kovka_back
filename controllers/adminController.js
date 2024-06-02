const { Product, ProductInfo, Type } = require('../models/models');
const ApiError = require('../error/ApiError');
const path = require('path');
const uuid = require('uuid');

class AdminController {
    // Добавление продукта
    async addProduct(req, res, next) {
        try {
            let { direction, price, typeId, info } = req.body; 
            const { img } = req.files;
            let filename = uuid.v4() + ".jpg";
            img.mv(path.resolve(__dirname, '..', 'static', filename));
    
            const product = await Product.create({
                direction,
                price,
                typeId, // сохраняем typeId в базе данных
                img: filename
            });
    
            // Добавление информации о товаре
            if (info) {
                info = JSON.parse(info);
                info.forEach(i => 
                    ProductInfo.create({
                        title: i.title,
                        description: i.description,
                        productId: product.id
                }));
            }
            return res.json(product);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    // Редактирование товара
    async editProduct(req, res, next) {
        try {
          const { productId } = req.params;
          let { direction, price, typeId, info } = req.body;
          const product = await Product.findByPk(productId);
      
          if (!product) {
            throw new Error('Продукт не найден');
          }
      
          // Проверка на наличие изображения
          if (req.files && req.files.img) {
            const { img } = req.files;
            let filename = uuid.v4() + ".jpg";
            img.mv(path.resolve(__dirname, '..', 'static', filename));
            product.img = filename;
          }
      
          // Обновление основной информации о товаре
          product.direction = direction;
          product.price = price;
          product.typeId = typeId;
          await product.save();
      
          // Обновление информации о продукте
          if (info) {
            info = JSON.parse(info);
            // Удаление старой информации о продукте
            await ProductInfo.destroy({ where: { productId: product.id } });
            // Создание или обновление новой информации о продукте
            await Promise.all(info.map(i => ProductInfo.create({
              title: i.title,
              description: i.description,
              productId: product.id
            })));
          }
      
          return res.json(product);
        } catch (error) {
          // Обработка ошибок
          next(ApiError.badRequest(error.message));
        }
    }

    // Удаление товара
    async deleteProduct(req, res, next) {
        try {
            const { productId } = req.params;
    
            // Находим товар по его идентификатору
            const product = await Product.findByPk(productId);
            if (!product) {
                throw new Error('Товар не найден');
            }
    
            // Удаляем связанные записи из таблицы ProductInfo
            await ProductInfo.destroy({ where: { productId: productId } });
    
            // Удаляем сам товар
            await product.destroy();
    
            res.json({ success: true });
        } catch (error) {
            console.error('Ошибка при удалении товара:', error);
            next(ApiError.badRequest(error.message));
        }
    }

    // Добавление типа товара
    async createType(req, res, next) {
        try {
            const { name } = req.body;
            const type = await Type.create({ name });
            return res.json(type);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    // Удаление типа товара
    async deleteType(req, res, next) {
        try {
            const { typeId } = req.params;
            const type = await Type.findByPk(typeId);
            if (!type) {
                throw new Error('Тип товара не найден');
            }
            await type.destroy();
            return res.json({ success: true });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
}

module.exports = new AdminController();