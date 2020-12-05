const PORT = process.env.PORT || 8000;
const express = require('express');
const app = express();

const http = require('http');

const io = require('socket.io')(http);


app.get('/su',async (req, res) => {
  io.on('connection', socket => {
    console.log('connect');
    return res.send("i am sorry");
  });
})

app.listen(PORT, () => console.log('servidor activo: ' + PORT));
