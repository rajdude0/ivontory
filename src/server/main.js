import * as dotenv from 'dotenv'
import path from "path";
const result = dotenv.config({ path: path.join(path.resolve(), ".env" )});
import express  from "express";
import ViteExpress from  "vite-express";
import bodyParser from "body-parser";
import {apiRouter, isAdminSesion} from "./api.js";
import fileupload from "express-fileupload"
import passport  from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import uid from 'uid-safe';
import { BasicStrategy } from "passport-http"



const genuuid = function(){
  return uid.sync(18);
}


Object.entries(result).map(([k ,v])=> process.env[k]=v); 


const app = express();

const users = {
    "rajesh": "rajesh123",
    "admin": "rahul1994"
}


app.use(bodyParser.json());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret:'ivontory-adlafijakd',
  saveUninitialized:true,
  resave:false,
  cookie:{
    path:"/",
    httpOnly:true,
    maxAge:5*60*1000,
  },
  name:"ivontory",
  genid:function(req){
    return genuuid()
  }
}))

app.use(express.static(path.join(path.resolve(), "public")))
app.use(express.static(path.join(path.resolve(), "uploads")))


app.use(fileupload(
  {
    preserveExtension:4,
    createParentPath: true
  }
))


app.use("/api", apiRouter);

app.use("/admin", isAdminSesion, (req, res, next) => {
    next();
})

app.use((err, req, res, next) => {
  if(err) {
    res.status(res.statusCode || 500).json({error: err});
  }
  next();
})

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
