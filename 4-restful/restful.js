import express from 'express'
import allPets from '../pets.json' assert {type: 'json'};
import fs from 'fs'

const app = express();

app.use(express.json());
app.use(logger);

app.get('/pets', (req, res) => {
    res.send(allPets);
})

app.get('/pets/:id', (req, res, next) => {
    const { id } = req.params
    if ( id < 0 || id >= allPets.length) {
        res.status(404).send('Not Found. Index out of bounds.')
    }
    res.send(allPets[id]);
})


app.post('/pets', (req, res) => {
    const { name, age, kind } = req.body
    
    //Post request is valid, else send 400
    if (name != null && Number.isInteger(age) && kind != null && age >= 0) {//updated to >= 0
        allPets.push(req.body);
        console.log(allPets);
        fs.writeFile('../pets.json', JSON.stringify(allPets), (err) => {
            if (err) throw err;
        })
        res.send(req.body)
    }
    res.status(400).send("Invalid pet. Expected input - {Name: String, Age: Integer, Kind: String}")

});

app.patch('/pets/:id', (req, res) => {
    const { id } = req.params;
    const petData = req.body
    for (let keys in petData) {
      //allpets[index] [key =name] = petData [key =name]
      allPets[id][keys] =  petData[keys];
    }
    
    fs.writeFile('../pets.json', JSON.stringify(allPets), (err) => {
      if (err) throw err;
    })
  
  res.send(allPets[id]);   
})

app.delete('/pets/:id', (req, res) => {
    const { id } = req.params;
    const killedAnimal = allPets[id].kind
    allPets.splice(id, 1)

    if (!isNaN(id) || id >= 0 || id < allPets.length) {
        fs.writeFile('../pets.json', JSON.stringify(allPets), (err) => {
            if (err) throw err;
        })
    
        res.send(`You killed the ${killedAnimal}!`)
    }

    res.status(400).send(`Could not kill`)
})



app.listen(8000, ()=> {
    console.log("App listening at 8000");
  })
  
  function logger(req, res, next) {
    console.log("Request Method: ", req.method);
    console.log("Request Path: ", req.url)
    next();
  }