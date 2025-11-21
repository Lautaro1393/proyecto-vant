// Tabla Drones
/* 
import nodemon from "nodemon";
import { pilotos } from "./pilotos.service"; */

export const drones = [
  {
    id_dron: 1,
    matricula: "VANT-001",
    numero_de_serie: "M30T-A123",
    fecha_adquisicion: "2024-01-15",
    estado: "En Servicio",
    fecha_mantenimiento: "2025-10-01",
    observaciones: "Sensor térmico calibrado.",
    imagen: "/uploads/dron_001.jpg",
    modelo_dron_id: 1,
    deleted_at: null,
    piloto_id: 1 // Asignado a Laura García
  },
  {
    id_dron: 2,
    matricula: "VANT-002",
    numero_de_serie: "M3T-B456",
    fecha_adquisicion: "2024-03-20",
    estado: "En Servicio",
    fecha_mantenimiento: "2025-09-15",
    observaciones: "Hélices nuevas.",
    imagen: "/uploads/dron_002.jpg",
    modelo_dron_id: 2,
    deleted_at: null,
    piloto_id: 2 // Asignado a Carlos Rodríguez
  },
  {
    id_dron: 3,
    matricula: "VANT-003",
    numero_de_serie: "M30T-C789",
    fecha_adquisicion: "2024-01-15",
    estado: "En Mantenimiento",
    fecha_mantenimiento: "2025-11-10",
    observaciones: "Fallo en gimbal. Revisar.",
    imagen: "/uploads/dron_003.jpg",
    modelo_dron_id: 1,
    deleted_at: null,
    piloto_id: null // Sin asignar
  },
  {
    id_dron: 4,
    matricula: "VANT-004",
    numero_de_serie: "M3T-D101",
    fecha_adquisicion: "2024-06-05",
    estado: "En Servicio",
    fecha_mantenimiento: "2025-10-05",
    observaciones: "Batería #3 reporta fallos.",
    imagen: "/uploads/dron_004.jpg",
    modelo_dron_id: 2,
    deleted_at: null,
    piloto_id: 3 // Asignado a Ana Martínez
  },
  {
    id_dron: 5,
    matricula: "VANT-005",
    numero_de_serie: "M30T-E112",
    fecha_adquisicion: "2024-05-10",
    estado: "En Servicio",
    fecha_mantenimiento: "2025-10-20",
    observaciones: "Todo OK.",
    imagen: "/uploads/dron_005.jpg",
    modelo_dron_id: 1,
    deleted_at: null,
    piloto_id: 6 // Asignado a Martín Pérez
  },
  {
    id_dron: 6,
    matricula: "VANT-006",
    numero_de_serie: "M3T-F131",
    fecha_adquisicion: "2024-06-05",
    estado: "En Servicio",
    fecha_mantenimiento: "2025-10-05",
    observaciones: "Sensor RGB OK.",
    imagen: "/uploads/dron_006.jpg",
    modelo_dron_id: 2,
    deleted_at: null,
    piloto_id: null // Sin asignar
  },
  {
    id_dron: 7,
    matricula: "VANT-007",
    numero_de_serie: "M30T-G141",
    fecha_adquisicion: "2024-08-01",
    estado: "Fuera de Servicio",
    fecha_mantenimiento: "2025-05-01",
    observaciones: "Daño por agua. No reparar.",
    imagen: "/uploads/dron_007.jpg",
    modelo_dron_id: 1,
    deleted_at: "2025-05-02T14:30:00Z", // <-- Ejemplo de borrado lógico
    piloto_id: null
  },
  {
    id_dron: 8,
    matricula: "VANT-008",
    numero_de_serie: "M3T-H151",
    fecha_adquisicion: "2024-09-10",
    estado: "En Servicio",
    fecha_mantenimiento: "2025-10-15",
    observaciones: "Altavoz OK.",
    imagen: "/uploads/dron_008.jpg",
    modelo_dron_id: 2,
    deleted_at: null,
    piloto_id: 7 // Asignado a Valentina Sánchez
  },
  {
    id_dron: 9,
    matricula: "VANT-009",
    numero_de_serie: "M30T-I161",
    fecha_adquisicion: "2024-08-01",
    estado: "En Servicio",
    fecha_mantenimiento: "2025-10-01",
    observaciones: "Faro OK.",
    imagen: "/uploads/dron_009.jpg",
    modelo_dron_id: 1,
    deleted_at: null,
    piloto_id: null // Sin asignar
  },
  {
    id_dron: 10,
    matricula: "VANT-010",
    numero_de_serie: "M3T-J171",
    fecha_adquisicion: "2024-09-10",
    estado: "En Servicio",
    fecha_mantenimiento: "2025-10-15",
    observaciones: "RTK OK.",
    imagen: "/uploads/dron_010.jpg",
    modelo_dron_id: 2,
    deleted_at: null,
    piloto_id: 8 // Asignado a Diego Ramírez
  }
];

//// obtener toda la tabla

export const getAllDrones = () => {
    return drones;
}

export const getDronByID = (id_dron) => {
    return drones.find((item)=> item.id_dron == id_dron);
}

//////////////// crear dron ///////////////////

export const crearDron = ( matricula, numero_de_serie, fecha_adquisicion, estado, fecha_mantenimiento, observaciones, imagen, modelo_dron_id, deleted_at, piloto_id) => {
    return{
    id_dron: drones.length +1,
    matricula,numero_de_serie,fecha_adquisicion, estado, fecha_mantenimiento, observaciones, imagen, modelo_dron_id, deleted_at, piloto_id};
};

/////////////// Borrar Dron ////////////////


export const borrarDron = (id_dron) => {
    const index = drones.findIndex((item)=> item.id_dron === id_dron);
    if (index === -1) {
        return -1
    }
    const dronBorrado = drones.splice(index, 1)[0];
    return dronBorrado
}

////////////// modificar Dron mediante PUT //////////////////////

export const actualizarDron = (idDron) => {
    return drones.findIndex((item)=> item.id_dron === idDron);
}