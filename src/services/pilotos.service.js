///// GET all y get by ID
import * as model from '../models/pilotos.model.js'

export const getAllPilotos = () => {
    return model.getAllPilotos();
};

export const getPilotoByID = (id_pilotos) => {
    return model.getPilotoByID(id_pilotos)
}

/////////////////// Crear Piloto //////////////////

export const crearPiloto = (nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol, deleted_At) => {
    return model.crearPiloto(nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol, deleted_At)
    /*  {
        id_pilotos: pilotos.length +1,
        nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol, deleted_At
    }; */
};

////////////////// Borrar Piloto /////////////

export const borrarPiloto = (id_pilotos) => {
    const index = pilotos.findIndex((item) => item.id_pilotos === id_pilotos);
    if (index === -1) {
        return -1
    }
    const borrado = pilotos.splice(index, 1)[0]; // elimina un elemento en el indice encontrado
    return borrado
}

//////////// Modificar Piloto mediante Put /////////////////

export const actualizarPiloto = (idPiloto) => {
    return pilotos.findIndex((item) => item.id_pilotos === idPiloto);
}