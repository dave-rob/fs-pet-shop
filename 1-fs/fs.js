#!
const {exit} = require('node:process')
const fs = require('fs');
const selection = process.argv[2];
//console.log(process.argv);

if(!selection){
    console.error("Usage: node fs.js [read | create | update | destroy]")
    exit(1);
}
let pets = [];
fs.readFile("../pets.json", "utf-8", function(error, data){
    if(error){
        console.log(error);
        exit(1);
    }
     pets = JSON.parse(data);
})

    

function read() {
        const index = process.argv[3];
        if (!index){
            console.log(pets);
        } else if (index < 0 || index >=pets.length || !Number.isInteger(Number(index))){
            console.error("Usage: node fs.js read INDEX")
            exit(1);
        } else if(index < pets.length){
            console.log(pets[index])
        } 
    
}

function create() {
    const age = process.argv[3];
    const kind = process.argv[4];
    const name = process.argv[5];

    if(!name || !Number.isInteger(Number(age))){
        console.error("Usage: node fs.js create AGE KIND NAME");
    } else{
        newPet = {
            "age": Number(age),
            "kind": kind,
            "name": name,
        }
        pets.push(newPet);
        fs.writeFile("../pets.json", JSON.stringify(pets), function(error){
            error ? console(error) : console.log(newPet);
        })
    }

}

function update() {
    const index = process.argv[3];
    const age = process.argv[4];
    const kind = process.argv[5];
    const name = process.argv[6];

    if(index <0 || !name || !Number.isInteger(Number(index)) || !Number.isInteger(Number(age))){
        console.error("Usage: node fs.js update INDEX AGE KIND NAME");
    } else {
        pets[index]["age"] = Number(age);
        pets[index]["kind"] = kind;
        pets[index]["name"] = name;
        fs.writeFile("../pets.json", JSON.stringify(pets), function(error){
            error ? console(error) : console.log(pets[index]);
        })
    }
}

function destroy() {
    const index = process.argv[3];

    if (index < 0 || index >=pets.length || !Number.isInteger(Number(index))){
        console.error("Usage: node fs.js destroy INDEX")
        exit(1);
    } else {
        let oldPet = pets.splice(index, 1);
        fs.writeFile("../pets.json", JSON.stringify(pets), function(error){
            error ? console(error) : console.log(oldPet[0]);
        })
    }
}

setTimeout(function(){
    switch(selection.toLowerCase()){
        case 'read': read();
                    break;
        case 'update': update();
                    break;
        case 'create': read();
                    break;
        case 'destroy': update();
                    break;
        default: console.error("Usage: node fs.js [read | create | update | destroy]")
        exit(1);
    }
}, 1000);
