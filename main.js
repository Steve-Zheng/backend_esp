const bodyParser = require("body-parser");
const http = require('http');
const path = require("path");
const webSocket = require('ws');
const express = require('express');
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const server = http.createServer(app);//create a server

const s = new webSocket.Server({server});

let currentState = "ledOff";

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

s.on('connection',function (ws,req){
    ws.on('message',function (message){
        console.log("Received:"+message);
        if(message === "ledOn" || message === "ledOff") {
            currentState = message;
            console.log("Current state changed to "+currentState);
            s.clients.forEach(function (client){
                client.send(message);
            });
        }
        else if (message === "queryState"){
            console.log("Received query state");
            s.clients.forEach(function (client){
                if(client === ws){
                    client.send(currentState);
                }
            });
        }
    });
    ws.on('close',function (){
        console.log("lost one client");
    });
    console.log("new client connected");
});
server.listen(3000);