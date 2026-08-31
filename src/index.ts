import colors from "colors"
import server from "./server"
import { env } from "./config/env"

const port = Number(env.PORT) || 4000

if (env.NODE_ENV !== "test") {
  server.listen(port, "0.0.0.0", () => {
    console.log(colors.blue.bold(`Server running on port ${port}`))
  })
}
