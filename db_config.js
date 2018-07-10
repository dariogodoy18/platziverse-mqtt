const debug = require('debug')

const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'dario',
  password: process.env.DB_PASS || 'admin',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: s => debug(s),
  operatorsAliases: false
}

module.exports = config
