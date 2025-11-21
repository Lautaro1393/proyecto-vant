// tablas
export const pilotos = [
    {
    id_pilotos: 1,
    nombre: "Laura",
    apellido: "García",
    dni: 30123456,
    certificacion: "A-54321",
    vencimiento_cma: "2026-10-20",
    email: "laura.garcia@vant.com",
    contacto: 1155667788,
    rol: "Admin",
    deleted_at: null
},
{
    id_pilotos: 2,
    nombre: "Carlos",
    apellido: "Rodríguez",
    dni: 32789012,
    certificacion: "B-98765",
    vencimiento_cma: "2025-11-15",
    email: "carlos.r@vant.com",
    contacto: 1122334455,
    rol: "Usuario",
    deleted_at: null
},
{
    id_pilotos: 3,
    nombre: "Ana",
    apellido: "Martínez",
    dni: 35456789,
    certificacion: "A-12345",
    vencimiento_cma: "2026-05-30",
    email: "ana.martinez@vant.com",
    contacto: 1199887766,
    rol: "Usuario",
    deleted_at: null
  },
  {
      id_pilotos: 4,
      nombre: "Javier",
      apellido: "López",
      dni: 28901234,
      certificacion: "B-67890",
      vencimiento_cma: "2025-08-22",
      email: "javier.lopez@vant.com",
      contacto: 1144556677,
      rol: "Usuario",
      deleted_at: null
    },
    {
        id_pilotos: 5,
        nombre: "Sofía",
        apellido: "Gómez",
        dni: 38123456,
        certificacion: "A-23456",
        vencimiento_cma: "2024-01-10",
        email: "sofia.gomez@vant.com",
        contacto: 1133221144,
        rol: "Usuario",
        deleted_at: "2025-10-01T10:00:00Z" // <-- Ejemplo de borrado lógico
    },
    {
        id_pilotos: 6,
        nombre: "Martín",
        apellido: "Pérez",
        dni: 31789012,
        certificacion: "A-78901",
        vencimiento_cma: "2027-02-18",
    email: "martin.perez@vant.com",
    contacto: 1166778899,
    rol: "Admin",
    deleted_at: null
},
{
    id_pilotos: 7,
    nombre: "Valentina",
    apellido: "Sánchez",
    dni: 36456789,
    certificacion: "B-34567",
    vencimiento_cma: "2025-12-05",
    email: "valentina.s@vant.com",
    contacto: 1188776655,
    rol: "Usuario",
    deleted_at: null
},
{
    id_pilotos: 8,
    nombre: "Diego",
    apellido: "Ramírez",
    dni: 33901234,
    certificacion: "A-45678",
    vencimiento_cma: "2026-09-14",
    email: "diego.ramirez@vant.com",
    contacto: 1122113344,
    rol: "Usuario",
    deleted_at: null
},
  {
    id_pilotos: 9,
    nombre: "Camila",
    apellido: "Torres",
    dni: 39123456,
    certificacion: "B-56789",
    vencimiento_cma: "2027-07-07",
    email: "camila.torres@vant.com",
    contacto: 1155443322,
    rol: "Usuario",
    deleted_at: null
},
{
    id_pilotos: 10,
    nombre: "Lucas",
    apellido: "Fernández",
    dni: 34789012,
    certificacion: "A-67890",
    vencimiento_cma: "2026-03-25",
    email: "lucas.f@vant.com",
    contacto: 1199118822,
    rol: "Usuario",
    deleted_at: null
}
];
///// GET all y get by ID

export const getAllPilotos = () => {
    return pilotos;
};

export const getPilotoByID = (id_pilotos) => {
    return pilotos.find((item) =>  item.id_pilotos == id_pilotos);
}

/////////////////// Crear Piloto //////////////////

export const crearPiloto = (nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol, deleted_At) => {
    return {
        id_pilotos: pilotos.length +1,
        nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol, deleted_At
    };
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