import express from 'express';
import pg from 'pg';
import basicAuth from 'express-basic-auth';

const app = express();

const db = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "pet-shop",
    password: "123456",
    port: 5432
});

db.connect()

async function getPet(id){
    const result = await db.query("SELECT * FROM pets WHERE id = $1",[id])
    const pet = result.rows;
    return pet;
}

app.use(express.json());
app.use(basicAuth({
    users: { 'admin': 'meowmix'},
    unauthorizedResponse: req => (`unauthorized!`)
}))

app.get("/pets", async (req, res) => {
    try{
       let result = await db.query("SELECT * FROM pets;");
        let pets = result.rows;
        res.send(pets); 
    } catch (err) {
        res.status(500).send("Internal Server Error!");
    }
    
})

app.get("/pets/:id", async (req, res) => {
    const {id} = req.params;
    try{
        const pet = await getPet(id);
        if(JSON.stringify(pet) == '[]'){
        res.status(400).send("No pet resides at that index");
        } else {
        res.send(pet);
        }
    }
    catch(err) {
        res.status(400).send("Not an index");
    }
    
        
})

app.post('/pets', async (req, res) => {
    const { name, age, kind } = req.body
    const queryParams = [age, name, kind]
    try{
        await db.query("INSERT INTO pets VALUES (default, $1, $2, $3);", queryParams)
        res.send(req.body)
    } 
    catch (err) {
        res.status(400).send("Invalid pet. Expected input - {Name: String, Age: Integer, Kind: String}")
    }
    
});

app.patch('/pets/:id', async (req, res) => {
    const { id } = req.params;
    const petData = req.body
    try{
        let updatedVar =''
        for (let keys in petData) {
            console.log(keys, petData[keys], id);
            await db.query(`UPDATE pets SET ${keys} = $1 WHERE id = $2;`, [petData[keys], id])
            updatedVar+= keys + " "
        }
        res.send(`${updatedVar} was updated!`)
    } catch(err){
        console.error(err);
        res.status(400).send("Bad request. {Name: String, Age: Integer, Kind: String}")
    }   
})

 app.delete('/pets/:id', async (req, res) => {
    const {id} = req.params;
    try{
        await db.query("DELETE FROM pets WHERE id = $1;", [id]);
        res.send("Bye, Bye, Pet!");
    } catch(err){
        console.error(err);
        res.status(400).send("Bad Request. Invalid Index");
    }
 })

app.listen(3000, () => {
    console.log("server listening on port 3000");
})