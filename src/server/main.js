import * as dotenv from 'dotenv'
import path from "path";
const result = dotenv.config({ path: path.join(path.resolve(), ".env" )});
import express  from "express";
import ViteExpress from  "vite-express";
import bodyParser from "body-parser";
import {apiRouter} from "./api.js";
import fileupload from "express-fileupload"

Object.entries(result).map(([k ,v])=> process.env[k]=v); 


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.static(path.join(path.resolve(), "uploads")))


app.use(fileupload(
  {
    preserveExtension:4,
    createParentPath: true
  }
))


app.use("/api", apiRouter);

// app.use((err, req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     res.status(400)
//      return next(errors.errors);
//     }
//    next(err)
// })


app.use((err, req, res, next) => {
    if(err) {
      res.status( res.statusCode || 500 ).json({error:err});
    }
})


ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
