const { User, Basket, BasketProduct, Product } = require('../models/models');
const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateJwt = (id, email, role) => {
    return jwt.sign(
        {id, email, role},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    //регистрация пользователя
    async registration(req, res, next) {
      const { email, password } = req.body;
    
      if (!email || !password) {
        return next(ApiError.badRequest('Некорректный email или password'));
      }
    
      try {
        const candidate = await User.findOne({ where: { email } });
    
        if (candidate) {
          return next(ApiError.badRequest('Пользователь с таким email уже существует'));
        }
    
        const hashPassword = await bcrypt.hash(password, 5);
        const user = await User.create({ email, password: hashPassword, role: 'ADMIN' });
    
        const basket = await Basket.create({ userId: user.id });
        const token = generateJwt(user.id, user.email, user.role);
    
        return res.json({ token });
      } catch (error) {
        return next(ApiError.internal('Ошибка при регистрации', error));
      }
    }

    //авторизация пользователя
    async login(req, res, next) {
      const { email, password } = req.body
      const user = await User.findOne({ where: { email } })
      if (!user) {
          return next(ApiError.internal('Пользователь не найден'))
      }
      let comparePassword = bcrypt.compareSync(password, user.password)
      if (!comparePassword) {
          return next(ApiError.internal('Указан неверный пароль'))
      }
      const token = generateJwt(user.id, user.email, user.role)
      console.log("Token:", token); // Выводим токен в консоль
      console.log("Role:", user.role); // Выводим роль пользователя в консоль
      return res.json({ token, role: user.role })
  }

    //проверка генерации токена
    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role)
        return res.json({token})
    }

    // Добавление товара в корзину
    async addToBasket(req, res, next) {
        try {
            const { productId, quantity } = req.body;
            const userId = req.userId;
      
          let basket = await Basket.findOne({ where: { userId } });
      
          if (!basket) {
            basket = await Basket.create({ userId });
          }
      
          const product = await Product.findByPk(productId);
      
          if (!product) {
            return next(ApiError.notFound('Товар не найден'));
          }
      
          let basketProduct = await BasketProduct.findOne({
            where: { basketId: basket.id, productId },
          });
      
          if (basketProduct) {
            basketProduct.quantity += quantity;
            await basketProduct.save();
          } else {
            basketProduct = await BasketProduct.create({
              basketId: basket.id,
              productId,
              quantity,
            });
          }
      
          res.json({ message: 'Товар успешно добавлен в корзину' });
        }  catch (error) {
            next(ApiError.badRequest(error.message));
        }
      }
}
module.exports = new UserController()