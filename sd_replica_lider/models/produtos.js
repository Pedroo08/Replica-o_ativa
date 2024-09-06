const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');

const product = sequelize.define('product', {
    id: {
      type: DataTypes.INTEGER,   
  
      primaryKey: true,
      autoIncrement: true
    }, 
    nome: {
      type: DataTypes.STRING
    }
  
  });
  
  module.exports = product;