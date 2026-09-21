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
        res.status(500).send("Error occurred");
    }
})

app.get("/users/:userId", async (req, res) => {
    try {
        const result = await pool.query(`SELECT username, email
                                     FROM users
                                     WHERE id = $1`, 
                                     [req.params.userId]);
        if(result.rows.length === 1){
            res.status(200).send(result.rows[0]);
        } else {
            res.status(404).send("Not Found");
        }
    } catch(err){
        return res.status(500).send("Error occurred");
    }
})

app.post("/users/:userId/bottles", async (req, res) => {
    const userid = req.params.userId;
    const message = req.body.message;
    if(!message){
        return res.status(400).send("Invalid body");
    }
    try {
        const result = await pool.query(`INSERT INTO bottles (sender_id, message)
                                         VALUES($1, $2)
                                         RETURNING id, sender_id, message, status, created_at`
                                         , [userid, message]);
        res.status(201).send(result.rows[0]);
    } catch (err){
        if(err.code === "23503"){
            return res.status(404).send("Not found");
        } else {
            return res.status(500).send("Error occurred");
        }
    }
})

app.get("/users/:userId/bottles", async (req, res) => {
    try {
        const result = await pool.query(`SELECT id, sender_id, message, status, created_at
                                         FROM bottles
                                         WHERE sender_id = $1`
                                         , [req.params.userId]);
        res.status(200).send(result.rows);
    } catch (err) {
        res.status(500).send("Error occurred");
    }
})

module.exports = app;