import 'dotenv/config'
import mongoose from 'mongoose'
import { createApp } from './app.js'

const { ADMIN_PASSWORD, SESSION_SECRET, MONGODB_URI, STORAGE } = process.env
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12 || !SESSION_SECRET || SESSION_SECRET.length < 32) {
  throw Error('Set ADMIN_PASSWORD (12+ characters) and SESSION_SECRET (32+ characters) in .env.')
}
const memory = STORAGE === 'memory'
if (!memory) {
  if (!MONGODB_URI) throw Error('Set MONGODB_URI or explicitly use STORAGE=memory for temporary local testing.')
  await mongoose.connect(MONGODB_URI)
}
const app = createApp({ adminPassword: ADMIN_PASSWORD, secret: SESSION_SECRET, memory, origin: process.env.FRONTEND_ORIGIN })
const port = Number(process.env.PORT ?? 4000)
const listening = () => console.log('RoyalPrep API listening on port ' + port)
const server = process.env.HOST ? app.listen(port, process.env.HOST, listening) : app.listen(port, listening)
async function stop() { server.close(async () => { await mongoose.disconnect(); process.exit(0) }) }
process.on('SIGTERM', stop)
process.on('SIGINT', stop)
