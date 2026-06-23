import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'

import instrumentoRoutes from './routes/instrumentoRoutes.js'
import anuncioRoutes from './routes/anuncioRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import ciudadRoutes from './routes/ciudadRoutes.js'
import comarcaRoutes from './routes/comarcaRoutes.js'
import comentarioRoutes from './routes/comentarioRoutes.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/instrumentos', instrumentoRoutes)
app.use('/api/anuncios', anuncioRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/ciudades', ciudadRoutes)
app.use('/api/comarcas', comarcaRoutes)
app.use('/api/comentarios', comentarioRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})