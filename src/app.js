const express = require("express");
const cors = require("cors");
const logger = require("morgan");
require("dotenv").config();


const app = express();
const PORT = 8000;

app.use(cors({ origin: "*", credentials: true, optionsSuccessStatus: 202 }));
app.use(express.json({ limit: "10mb" }));
app.use(logger("dev"));




const routes = require("./routes");
app.use("/api", routes);

app.use((req, res) => {
  return res.status(404).send({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
