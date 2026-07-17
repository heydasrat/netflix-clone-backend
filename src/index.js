import connectDB from './db/index.js'
import { app } from './app.js'
import config from './config/config.js'

connectDB().then(() => {
    app.listen(config.port, () => {
        console.log(`The server is runing on http://localhost:${config.port}`)
    })
}).catch(() => {
    console.log("MongoDB Connection failed")
})