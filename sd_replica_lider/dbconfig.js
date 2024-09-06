// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('liderdb', 'postegres', '123456', {
  host: 'postgresql://postgresql:123456@localhost:5432/liderdb',
  dialect: 'postgres' // ou outro dialeto, como 'mysql'
});

module.exports = sequelize;
