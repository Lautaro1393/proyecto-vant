const pilotos = [
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

//////////////////////////////////////////////////////////////////

export const getAllPilotos = (req, res) => {
    res.json(pilotos);
    console.log(pilotos)
}

export const searchPiloto = (req,res)=>{
    const {nombre} = req.query;
    if(!nombre){
        return res.status(400).json({error: 'el parametro de busqueda nombre esta vacio'})
    }
    const pilotoFiltrado = pilotos.filter((piloto)=> piloto.nombre.toLowerCase().includes(nombre.toLocaleLowerCase())
);
console.log(req.query);
res.json(pilotoFiltrado)
};

export const getPilotoByID = (req,res)=>{
    const {id_pilotos} = req.params
    const piloto = pilotos.find((item) =>  item.id_pilotos == id_pilotos);
    
    //const piloto = pilotos.find((item) => item.id_pilotos == id_pilotos);
    console.log(piloto);
    if(!piloto){
        console.log('Error 404: Piloto no encotrado')
        return res.status(404).json({error: "'Piloto no encontrado"});
        
    }
    res.json(piloto);
};