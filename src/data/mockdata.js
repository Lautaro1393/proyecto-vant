
// ## 👨‍✈️ Pilotos (pilotos) - 

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


// ## 🚁 Drones 

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