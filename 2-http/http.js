const http = require("http");
const fs = require("fs");
const port = process.env.PORT || 8000;
let pets = [];


// reads the file, and puts the data in the pets array
fs.readFile("../pets.json", "utf-8", function (err, data) {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    pets = JSON.parse(data);
  }
});


//creates a server
const server = http.createServer(function (req, res) {
 
  //const index = Number(req.url.slice(req.url.lastIndexOf("/") +1))
  const petRegExp = /^\/pets\/(.*)$/;//looking for a pattern that is start of string / pets / anycharacter except line break  $=matches the end of input so nothing can come after.

  //if request for url/pets
  if (req.method === "GET" && req.url === "/pets") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(pets));
  } 
  //if req.url matches the pattern above
  else if (petRegExp.test(req.url)) {
    const index = Number(req.url.match(petRegExp)[1]);

    //making sure the index is a valid number and not a string
    if (req.method === "GET" && req.url === `/pets/${index}` && index < pets.length && index >= 0 && Number.isInteger(index)) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      onePet = JSON.stringify(pets[index]);
      res.end(onePet);
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("Not found");
    }
  } 
  
  //if the user posts a new pet to /pets
  else if (req.method === "POST" && req.url === "/pets") {
    let body = [];
    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        newPet = JSON.parse(body);

        //verify age is a number and name and kind are not empty
        if (Number.isInteger(Number(newPet.age)) && newPet.name != "" && newPet.kind != "") {
          pets.push(newPet);
          fs.writeFile("../pets.json", JSON.stringify(pets), function (err) {
            if (err) {
              console.error(err);
              process.exit(1);
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(newPet));
            }
          });
        } else {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end("Bad Request");
        }
      });
  } 
  
  //if not /pets or /pets/index or post to /pets
  else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not found");
  }
});

//opening up the server port to listen
server.listen(port, function () {
  console.log("Listening on port", port);
});
