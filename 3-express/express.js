// set up dependencies
const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser')
pets = [];

fs.readFile("../pets.json", "utf-8", function(err, data){
    if(err){
        console.error(error);
        exit(1);
    }
    pets = JSON.parse(data);
})

// function getIndex(url){
//     const petRegExp = /^\/pets\/(.*)$/;
//     if(petRegExp.test(url)){
//         const temp = Number(url.match(petRegExp)[1]);
//         if(Number.isInteger(temp) && temp < pets.length && temp >= 0){
//             index = temp;
//             console.log(index);
//             return true;
//         }
//     }
//     return false;
// }




app.use(function(err, req, res, next){
    console.log("Req.method: " + req.method);
    console.log("Req.url: " + req.url);
    //res.status(500).json({error: { message: "Internal Server Error" }})
    next(err);
})


// handle requests with routes
app.get('/pets', function(req,res){
    res.send(pets);
})

app.get(`/pets/:index`, function(req,res,next){ 
    const { index } = req.params;
    
    if(Number.isInteger(Number(index)) && index < pets.length && index >= 0){
        console.log(index);
        res.send(pets[index]);
    }
    
    next();
})

app.use(bodyParser.json())

app.post('/pets',(req, res, next) => {
    const { age, name, kind } = req.body;
    if(!Number.isInteger(age) || name.length == 0 || kind.length == 0){
        res.status(400).send("Bad Request");
    } else {
        pets.push(req.body)
    fs.writeFile('../pets.json', JSON.stringify(pets), (err) => {
        if(err){
            console.error(err);
            exit(1);
        } else {
            res.status(201).send(req.body);
        }
    })
    }
})

app.get('*', (req, res, next) => {
    next({ error: 'Something went wrong!'})
})

app.use((err, req, res, next) => {
    res.status(500).send(err)
})

// listen on a port
app.listen(3000, function(){
    console.log('server is running');
})