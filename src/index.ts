import colors from "colors"
import server from "./server"

const port = Number(process.env.PORT) || 4000

if (process.env.NODE_ENV !== "test") {
  server.listen(port, "0.0.0.0", () => {
    console.log(colors.blue.bold(`Server running on port ${port}`))
  })
}
