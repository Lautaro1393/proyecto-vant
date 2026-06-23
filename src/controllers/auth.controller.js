import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';

const DUMMY_BCRYPT_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.4Q8K7fWkL3pM5N6O7P8Q9R0S1T2U';

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({error: ' Faltan email o password'});
        }
        const [rows] = await pool.query('SELECT * FROM piloto WHERE email = ?', [email]);
        const piloto = rows[0];

        // Siempre correr bcrypt.compare (incluso si el email no existe) para
        // evitar timing attacks que permitan enumerar emails validos.
        const hashToCheck = piloto ? piloto.password : DUMMY_BCRYPT_HASH;
        const passwordOk = await bcrypt.compare(password, hashToCheck);
        if (!piloto || !passwordOk) {
            return res.status(401).json({error:'Credenciales invalidas'});
        }

        const token = jwt.sign(
            {id: piloto.id_pilotos, rol: piloto.rol},
            process.env.JWT_SECRET,
            { expiresIn: '1h'}
        );
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


