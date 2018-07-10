'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('platzivese_db')
const dbConfig = require('./db_config')

const backenk = {
  type: redis,
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backenk
}

const server = new mosca.Server(settings)

let Agent = null
let Metric = null

server.on('clientConnected', client => {
  debug(`Client Connected: ${client.id}`)
})

server.on('clientDisconnected', client => {
  debug(`Client Disconnected: ${client.id}`)
})

server.on('published', (packet, client) => {
  debug(`Recived: ${packet.topic}`)
  debug(`Payload: ${packet.payload}`)
})

server.on('ready', async () => {
  const service = await db(dbConfig).catch(handleFatalError)

  Agent = service.Agent
  Metric = service.Metric

  console.log(`${chalk.green('[plaziverse-mqtt] server is running')}`)
})

server.on('error', handleFatalError)

function handleFatalError (err) {
  console.error(`${chalk.red('[FATAL ERROR]')} ${err.message}`)
  console.log(err.stack)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
