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

//set the engine for the view
app.set('view engine', 'ejs');

//lets you get req.body from forms
app.use(express.urlencoded({ extended:true}));

app.use(express.json())

//app.use(express.static("public"));

//requires basic authorization
app.use(basicAuth({
    users: { 'admin': 'meowmix'},
    challenge: true,//gives popup if try to go to browser
    unauthorizedResponse: req => (`unauthorized!`)
}))

//redirect you to /pets
app.get("/", (req,res)=>{
    res.redirect("/pets");
})

//loads up index.ejs with all pets when going to /pets
app.get("/pets", async (req, res) => {
    try{
       let result = await db.query("SELECT * FROM pets;");
        let pets = result.rows;
        res.render("pages/index.ejs", {pets: pets});
        //res.send(pets); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error!");
    }
    
})

//loads up add.ejs when you go to /add
app.get("/add", async (req, res) => {
    try{
       //let result = await db.query("SELECT * FROM pets;");
        //let pets = result.rows;
        res.render("pages/add.ejs", {response: ''});
        //res.send(pets); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error!");
    }
    
})


//loads singlePet.ejs when you click on a pet
app.get("/pets/:id", async (req, res) => {
    const {id} = req.params;
    try{
        const pet = await getPet(id);
        // if(JSON.stringify(pet) == '[]'){
        // res.status(400).send("No pet resides at that index");
        // } else {
            console.log(pet[0]);
        res.render("pages/singlePet.ejs", {pet: pet[0]});
        //}
    }
    catch(err) {
        res.status(400).send("Not an index");
    }
    
        
})

//posts a pet into the database and shows you if added or error
app.post('/pets/add', async (req, res) => {
    const {name,age, kind}= req.body
    const queryParams = [age, kind, name]
    try{
        await db.query("INSERT INTO pets VALUES (default, $1, $2, $3);", queryParams)
        res.render("pages/add", {response: `${name} was added!`});
    } 
    catch (err) {
        res.render("pages/add", {response: "Invalid pet. Expected input - {Name: String, Age: Integer, Kind: String}"});
    }
    
});

//updates the pet 
app.post('/pets/:id/update', async (req, res) => {
    const { id } = req.params;
    const petData = req.body
    //console.log(petData)
    const allowedKeys = [ "name", "age", "kind" ];
    try{
        for (let keys in petData) {console.log(keys);
            if(petData[keys] != '' && allowedKeys.includes(keys) ){//
                await db.query(`UPDATE pets SET ${keys} = $1 WHERE id = $2;`, [petData[keys], id])
            } else{
                throw new Error("Nice try SQL Injection!");
            }
        }
        res.redirect(`/pets/${id}`)
    } catch(err){
        console.error(err);
        const pet = await getPet(id);
        res.render("pages/singlePet.ejs",{pet: pet[0], error:"Bad request. {Name: String, Kind: String, Age: Integer}"})
    }   
})

// app.patch('/pets/:id', async (req, res) => {
//     const { id } = req.params;
//     const petData = req.body
//     console.log(petData)
//     try{
//         let updatedVar =''
//         for (let keys in petData) {
//             console.log(keys, petData[keys], id);
//             await db.query(`UPDATE pets SET ${keys} = $1 WHERE id = $2;`, [petData[keys], id])
//             updatedVar+= keys + " "
//         }
//         res.send(`${updatedVar} was updated!`)
//     } catch(err){
//         console.error(err);
//         res.status(400).send("Bad request. {Name: String, Age: Integer, Kind: String}")
//     }   
// })

//when the delet button is clicked, takes you to this site and then performs the query
app.get('/pets/:id/delete', async (req, res) => {
    const {id} = req.params;
    try{
        await db.query("DELETE FROM pets WHERE id = $1;", [id]);
        res.redirect("/pets");
    } catch(err){
        console.error(err);
        res.status(400).send("Bad Request. Invalid Index");
    }
 })

//  app.delete('/pets/:id/', async (req, res) => {
//     const {id} = req.params;
//     try{
//         await db.query("DELETE FROM pets WHERE id = $1;", [id]);
//         res.send("Bye, Bye, Pet!");
//     } catch(err){
//         console.error(err);
//         res.status(400).send("Bad Request. Invalid Index");
//     }
//  })

//catch all
 app.get('*', (req, res, next) => {
    next('Internal Server Error')
})

app.use((err, req, res, next) => {
    res.status(500).send(err)
})

app.listen(3000, () => {
    console.log("server listening on port 3000");
})