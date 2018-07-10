'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('platzivese_db')
const dbConfig = require('./db_config')
const { parcePayload } = require('./ustils')

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
const clients = new Map()

let Agent = null
let Metric = null

server.on('clientConnected', client => {
  debug(`Client Connected: ${client.id}`)
  clients.set(client.id, null)
})

server.on('clientDisconnected', client => {
  debug(`Client Disconnected: ${client.id}`)
})

server.on('published', async (packet, client) => {
  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break
    case 'agent/message':
      debug(`Recived: ${packet.topic}`)

      const payload = parcePayload(packet.payload)

      if (payload) {
        payload.agent.connected = true

        let agent

        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError()
        }

        debug(`Agent ${agent.uuid} saved`)

        // Nottfy agent is connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }
      }

      break
  }
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

function handleError (err) {
  console.error(`${chalk.red('[FATAL ERROR]')} ${err.message}`)
  console.log(err.stack)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
