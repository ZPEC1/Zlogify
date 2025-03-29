import express from "express";
import routes from "./routes/index.js";
import path from "path";

const app = express();
const port = 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// Serve static files from "public" and Bootstrap from node_modules
app.use(express.static("public"));
app.use("/bootstrap", express.static(path.resolve("node_modules/bootstrap/dist")));

app.use("/", routes);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
