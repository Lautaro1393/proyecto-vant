import jwt from 'jsonwebtoken';

export const verificarToken = (req, res , next)=> {
    //1. Buscamos el token en el header
    const authHeader = req.headers['authorization'];

    //Si no hay header no pasa nadie
    if (!authHeader) {
        return res.status(403).json({error: "Acceso denegado. No se proporciono el token "});
    }

    // El token suele venir como "Bearer EyhaSDh ..."
    // Usamos split para separar la palabra Bearer del codigo real
    const token = authHeader.split(' ')[1];
    if(!token){
        return res.status(403).json({error:"Formato de token invalido"});
    }
    try {
        //2. verificamos si la firma es valida usando la palabra secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //3. Guardamos los datos del usuario (ID y ROL) en la peticion 
        req.user = decoded
        //4. (Next permite continuar al controlador)
        next();
    } catch(error){
        return res.status(401).json({error:"Token invalido o expirado"});
    }
};