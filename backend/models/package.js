import express from "express";


const server= express();

server.post("/", (ewq,res)=>{
    res.send("<h1>Hi</hi>");
})