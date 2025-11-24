import multer from "multer";
import path from 'path'


// 1. Configuración de Almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Carpeta donde se guardarán las imágenes
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Generamos un nombre único: nombre_campo + fecha + extensión
        // Ejemplo: imagen-123456789.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// 2. Filtro de Seguridad (Solo imágenes)
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Error: El archivo debe ser una imagen válida (jpg, png, gif)'));
};

// 3. Exportar el middleware configurado
export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por foto
    fileFilter: fileFilter
});