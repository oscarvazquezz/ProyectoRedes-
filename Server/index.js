
const PORT = process.env.PORT || 8000;
const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const http = require('http').Server(app);
const {Pool} = require('pg');
const { error } = require('console');
const socketIO = require('socket.io');
const io = socketIO(http);

const config = {
    user : 'postgres',
    host : 'localhost',
    password : 'twilight1235',
    database: 'BDChat'
}

const pool = new Pool(config);

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './templade')
    },
    
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

const subir = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/templade',express.static(path.join(__dirname,'/templade')));

app.get('',(req, res,next) => {
    return res.send("hola mundo UmU");
})

const myMessages=[];
io.on('connection',(socket) => {
    socket.emit('hello',{
      message : 'Hello World',id: socket.id
    })
  });

app.post('/subir/:name/:password', subir.single('file'),async (req, res,next) => {
    console.log(req.hostname)
    const file = req.file;
    console.log(file.filename)
    //var photo = 'http://localhost:8000/';
    //photo+= req.file.path.replace("\\", "/");
    if(!file){
      const error = new Error('No File')
      error.httpStatusCode = 400
      return next(error)
    }else{
        console.log("si hay datos")
    }
    try {
        var photo = 'http://191272hernandezsa1.ddns.net:8000/';  
        photo+=file.path.replace("\\", "/");
        const users = await pool.query("INSERT INTO Users (name,password,photo) VALUES ('"+req.params.name+"','"+req.params.password+"','"+photo+"');  ");
        return res.send(users.rows);
    } catch (error) {
        return res.send("i am sorry");
    }
   
})

app.put('/editar/:password/:id',subir.single('file'),async (req, res,next) => {
    const file = req.file;
    console.log(file.filename)
    if(!file){
      const error = new Error('No File')
      error.httpStatusCode = 400
      return next(error)
    }else{
        console.log("si hay datos")
    }
    try {
        var photo = 'http://191272hernandezsa1.ddns.net:8000/';
        photo+=file.path.replace("\\", "/");
        var id = parseInt(req.params.id);
        const users = await pool.query("UPDATE Users SET password = '"+req.params.password+"',photo = '"+photo+"' where iduser ='"+id+"';");
        return res.send(users.rows)
    } catch (error) {
        return res.send("i am sorry");
    }
})

app.get('/dataUser/:name',async (req, res) => {
    try {
        let name = req.params.name;
        const users = await pool.query("select name,nameuser,photo,idfriend from friends,users where friends.iduser = users.iduser and friends.nameuser='"+name+"'");
        return res.send(users.rows);
    } catch (e) {
        console.log(e);
        return res.send("i am sorry");
    }
})

app.post('/agregarAmigo/:name/:id/:nameAmigo/:idSolitante',async function (req, res){
   
    let name = req.params.name;
    let id = req.params.id;
    let nameAmigo = req.params.nameAmigo;
    let idSolitante = req.params.idSolitante;
    try {
        const users = await pool.query("INSERT INTO public.friends(nameuser,idUser) VALUES ('"+name+"','"+id+"');");
        const userA = await pool.query("INSERT INTO public.friends(nameuser,idUser) VALUES ('"+nameAmigo+"','"+idSolitante+"');");
        return res.send(userA.rows);
    } catch (error) {
        console.log(e);
        return res.send("i am sorry");
    }
})

app.get('/VeficiacionAmigos/:id/:name',async (req, res) => {
    try {
        let id = req.params.id;
        let name = req.params.name;
        const users = await pool.query("select exists (select nameuser from friends where iduser='"+id+"'and nameUser='"+name+"')");
        return res.send(users.rows);
    } catch (e) {
        console.log(e);
        return res.send("i am sorry");
    }
})

app.get('/busqueda/:name',async (req, res) => {
    try {
        let name = req.params.name;
        const users = await pool.query("select *FROM public.users where name = '"+name+"' ");
        return res.send(users.rows);
    } catch (e) {
        console.log(e);
        return res.send("i am sorry");
    }
})

app.get('/user/:id',async (req, res) => {
    try {
        let id = req.params.id;
        const users = await pool.query("select *FROM public.users where iduser = '"+id+"'");
        return res.send(users.rows);
    } catch (e) {
        console.log(e);
        return res.send("i am sorry");
    }
}
)

app.get('/login/:name/:password',async (req, res) => {
    try {
        let name = req.params.name;
        let password = req.params.password;
        const users = await pool.query("select *FROM public.users where name = '"+name+"'and password = '"+password+"'");
        return res.send(users.rows);
    } catch (e) {
        console.log(e);
        return res.send("i am sorry");
    }
}
)

app.post('/subirArchivo/:id/:name', subir.single('file'),async (req, res,next) => {
    console.log(req.hostname)
    const file = req.file;
    console.log(file.filename)
    let id = req.params.id;
    let name = req.params.name;
    if(!file){
      const error = new Error('No File')
      error.httpStatusCode = 400
      return next(error)
    }else{
        console.log("si hay datos ")
    }
    try {
        var photo = 'http://191272hernandezsa1.ddns.net:8000/';  
        photo+=file.path.replace("\\", "/");
        const users = await pool.query("INSERT INTO public.archivos(archivo,nombre,emisor,idfriend) VALUES ('"+photo+"','"+file.filename+"','"+name+"','"+id+"');");
        return res.send(users.rows);
    } catch (error) {
        return res.send("i am sorry");
    }  
})

app.get('/VeficiacionAmigo/:id/:name',async (req, res) => {
    try {
        let id = req.params.id;
        let name = req.params.name;
        const users = await pool.query("select nameuser,idfriend from friends where iduser='"+id+"'and nameUser='"+name+"'");
        return res.send(users.rows);
    } catch (e) {
        console.log(e);
        return res.send("i am sorry");
    }
})

app.get('/mostrarArchivos/:name/:id',async (req,res)=>{

    try {
        let id = req.params.id;
        let name = req.params.name;
        const users = await pool.query("select archivo,iduser,nombre from archivos,friends where archivos.idfriend = friends.idfriend and emisor = '"+name+"'and friends.idfriend ='"+id+"';");
        return res.send(users.rows);
    } catch (e) {
        console.log(e);
        return res.send("i am sorry");
    }

})

app.post('/agregarMensaje/:id/:emisor/:mensaje',async function (req, res){
   
    let id = req.params.id;
    let nameEmisor = req.params.emisor;
    let mensaje = req.params.mensaje;
    try {
        const userA = await pool.query("INSERT INTO public.chat( conversacion, idfriend, emisor) VALUES ('"+mensaje+"','"+id+"','"+nameEmisor+"');")
        return res.send(userA.rows);
    } catch (error) {
        console.log(e);
        return res.send("i am sorry");
    }
})

app.get('/mostrarMensaje/:name/:id',async (req,res)=>{

    try {
        let id = req.params.id;
        let name = req.params.name;
        const users = await pool.query("select conversacion,emisor from chat,friends where chat.idfriend = friends.idfriend and emisor = '"+name+"'and friends.idfriend ='"+id+"';");
        return res.send(users.rows);
    } catch (e) {
        console.log(e);
        return res.send("i am sorry");
    }

})

app.listen(PORT, () => console.log('servidor activo: ' + PORT));