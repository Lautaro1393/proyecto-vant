import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        //1. validar que vengan los datos
        if (!email || !password) {
            return res.status(400).json({error: ' Faltan email o password'});
        }
        //2. Buscar al usuario por email en la BD
        const [rows] = await pool.query('SELECT * FROM piloto WHERE email = ?', [email]);
        const piloto = rows[0];
        //Si no existe el usuario
        if (!piloto) {
            return res.status(401).json({error:'Credenciales invalidas'});
        }
        //4. Generar el Token JWT
        //Guardamos en el token el ID y el ROL 
        const token = jwt.sign(
            {id: piloto.id_pilotos, rol: piloto.rol},
            process.env.JWT_SECRET,
            { expiresIn: '1h'} // el token se vence en 1h
        );
        //5. Responder con el token
        res.json({
            message: "Login exitoso",
            token: token,
            piloto: {
                id: piloto.id_pilotos,
                nombre: piloto.nombre,
                rol: piloto.rol
            }
        });
    } catch(error){
        console.error(error);
        res.status(500).json({error: "Error en el servidor"});
    }
};