import colors from "colors"
import server from "./server"

const port = process.env.PORT || 4000

if (process.env.NODE_ENV !== 'test') {
    server.listen(port, () => {
        console.log(colors.blue.bold(`Server running in: ${port}`))
    })
}