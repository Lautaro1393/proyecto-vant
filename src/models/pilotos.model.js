import fs from 'fs';
import path from 'path';

const __dirname = import.meta.dirname;
const pathArchivo =  path.join(__dirname, './pilotos.json');
const json = fs.readFileSync(pathArchivo, "utf-8");
const pilotos = JSON.parse(json);
console.log(pilotos);

////////////////////////////////////////

export const getAllPilotos =() => {
    return pilotos
}

export const getPilotoByID = (id_pilotos) => {
    return pilotos.find((item) =>  item.id_pilotos == id_pilotos)
}


//////////////////// Crear nuevo piloto //////////////////////

export const crearPiloto = (data) => {    
     const nuevoPiloto = {
        id_pilotos: pilotos.length +1,
        ...data
    /*     nombre, 
        apellido,
         dni,
          certificacion,
           vencimiento_cma,
            email,
             contacto,
              rol,
               deleted_At */

     };
     pilotos.push(nuevoPiloto);
     fs.writeFileSync(pathArchivo, JSON.stringify(pilotos, null, 2), 'utf-8');
     return nuevoPiloto
};

///////////////// Borrar Piloto ////////////////////

export const borrarPiloto = (id_pilotos) => {
    const pilotoIndex = pilotos.findIndex((item)=> item.id_pilotos == id_pilotos);
    if (pilotoIndex === -1) {
        return null; // si no se encuentra el piloto devolvemos null
    }
    else{
        const pilotoBorrado = pilotos.splice(pilotoIndex,1)[0]; 
        fs.writeFileSync(pathArchivo, JSON.stringify(pilotos, null, 2), "utf-8");
        return pilotoBorrado;
    }
}