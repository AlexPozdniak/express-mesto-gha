const cardSchema = require('../models/card');
const Forbidden = require('../errors/forbidden');
const NotFound = require('../errors/notFound');
const BadRequest = require('../errors/badRequest');

module.exports.getAllCards = (req, res, next) => {
  cardSchema
    /*.find({})*/
    .find()
    .then((cards) => {
      /*res.send(cards);*/
      return res.status(200).send(cards)
    })
    .catch(next);
};

module.exports.addCard = (req, res, next) => {
  const { _id } = req.user;
  const { name, link } = req.body;

  cardSchema
    .create({ name, link, owner: _id })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequest('переданы некорректные данные карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  cardSchema
    .findById({ _id: cardId })
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточка с данным _id не найдена');
      }
      if (!card.owner.equals(req.user._id)) {
        throw new Forbidden('Доступ запрещен');
      }
      card
        .deleteOne()
        .then(() => res.status(200).send({ message: 'Карточка удалена.' }))
        .catch((error) => {
          next(error);
        });
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequest('Неверный id'));
      } else {
        next(error);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  const id = req.user._id;
  const { cardId } = req.params;

  cardSchema
    .findByIdAndUpdate(cardId, { $pull: { likes: id } }, { new: true })
    .then((card) => {
      /*if (!card) {
        throw new NotFound('Карточка с данным _id не найдена');
        По идее в then мы попадаем если карточка найдена. Лишняя проверка
      }*/
      res.send(card);
    })
    .catch((error) => {
      if (error.name === 'DocumentNotFoundError') {
        next(new NotFound('Карточка не найдена'));
      }
      if (error.name === 'CastError') {
        next(new BadRequest('Неверный id'));
      } /*else {
        next(error);
      }*/
      next(error);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const id = req.user._id;
  const { cardId } = req.params;

  cardSchema
    .findByIdAndUpdate(cardId, { $pull: { likes: id } }, { new: true })
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточка с данным _id не найдена');
      }
      res.send(card);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequest('Неверный id'));
      } else {
        next(error);
      }
    });
};
