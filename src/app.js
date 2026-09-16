const express = require("express");
const pool = require("./db/connection");

const app = express();

app.use(express.json());

app.get("/" , (req, res) => {
    res.send("Bottled API");
})

app.post("/users", async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    
    if(!email || !username){
        return res.status(400).send("Invalid body");
    }

    try {const result = await pool.query(`INSERT INTO users (username, email)
                                        VALUES ($1, $2)
                                        RETURNING id, username, email, created_at`,
                                        [username, email]);
            res.status(201).send(result.rows[0]);
    } catch(err){
        if(err.code === '23505'){
            return res.status(409).send("Username or email already exists");
        }
        res.status(500).send("Error occured");
    }
})

app.get("/users/:userId", async (req, res) => {
    const result = await pool.query(`SELECT username, email
                                     FROM users
                                     WHERE id = $1`, 
                                     [req.params.userId]);
    if(result.rows.length === 1){
        res.status(200).send(result.rows[0]);
    } else {
        res.status(404).send("Not Found");
    }
})

module.exports = app;