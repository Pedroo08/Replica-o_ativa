const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');

const comand = sequelize.define('comand', {
    id: {
      type: DataTypes.INTEGER,   
  
      primaryKey: true,
      autoIncrement: true
    },
    sql: {
      type: DataTypes.STRING
    }
  
  });
  
  module.exports = comand;