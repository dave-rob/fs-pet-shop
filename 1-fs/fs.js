#!/usr/bin/env node
const {exit, argv} = require('node:process');
const {log, error} = require('node:console');
const fs = require('fs');
const selection = argv[2];

if(!selection){
    error("Usage: node fs.js [read | create | update | destroy]")
    exit(1);
}

let pets = [];

function loadContent(){
    fs.readFile("../pets.json", "utf-8", function(err, data){
    if(err){
        error(err);
        exit(1);
    } else{
        pets = JSON.parse(data);
    }
     
     switch(selection.toLowerCase()){
        case 'read': read();
                    break;
        case 'update': update();
                    break;
        case 'create': create();
                    break;
        case 'destroy': destroy();
                    break;
        default: error("Usage: node fs.js [read | create | update | destroy]")
        exit(1);
     }
})
}

function read() {
        const index = argv[3];
        if (!index){
            log(pets);
        } else if (index < 0 || index >=pets.length || !Number.isInteger(Number(index))){
            error("Usage: node fs.js read INDEX")
            exit(1);
        } else if(index < pets.length){
            log(pets[index])
        }  
}

function create() {
    const age = argv[3];
    const kind = argv[4];
    const name = argv[5];

    if(!name || !Number.isInteger(Number(age))){
        error("Usage: node fs.js create AGE KIND NAME");
    } else{
        const newPet = {
            "age": Number(age),
            "kind": kind,
            "name": name,
        }
        pets.push(newPet);
        fs.writeFile("../pets.json", JSON.stringify(pets), function(err){
            err ? error(err) : log(newPet);
        })
    }
}

function update() {
    const index = argv[3];
    const age = argv[4];
    const kind = argv[5];
    const name = argv[6];

    if(index <0 || !name || !Number.isInteger(Number(index)) || !Number.isInteger(Number(age))){
        error("Usage: node fs.js update INDEX AGE KIND NAME");
    } else {
        pets[index]["age"] = Number(age);
        pets[index]["kind"] = kind;
        pets[index]["name"] = name;
        fs.writeFile("../pets.json", JSON.stringify(pets), function(err){
            err ? error(err) : log(pets[index]);
        })
    }
}

function destroy() {
    const index = argv[3];

    if (index < 0 || index >=pets.length || !Number.isInteger(Number(index))){
        error("Usage: node fs.js destroy INDEX")
        exit(1);
    } else {
        let oldPet = pets.splice(index, 1);
        fs.writeFile("../pets.json", JSON.stringify(pets), function(err){
            err ? error(err) : log(oldPet[0]);
        })
    }
}

loadContent();