import pkg from "pg"
const { Pool } = pkg;



const PG_USER = process.env['PG_USER'] || "postgres"
const PG_PASSWORD = process.env['PG_PASSWORD'] || "password"
const PG_HOST = process.env['PG_HOST'] || "localhost"
const PG_PORT = process.env['PG_PORT'] || 5432
const PG_DATABASE = process.env["PG_DATABASE"] || "ivontory";


export const db  = new Pool({
    user: PG_USER,
    password: PG_PASSWORD,
    host: PG_HOST,
    database: PG_DATABASE,
    port: PG_PORT,
})

db.connect();




