import pkg from "pg";

const {Pool} = pkg;

export const pool = new Pool({
    user: "postgres",
    host:"localhost",
    database:"collaborative_editor",
    password:"abhinav",
    port: 5432,

});