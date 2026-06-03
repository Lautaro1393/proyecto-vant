# Project Specification: Sistema VANT (Vehículos Aéreos No Tripulados)

## 1. General Overview
Este proyecto es un backend desarrollado en Node.js y Express para la gestión técnica y operativa de misiones con drones (VANT). El sistema centraliza el control de inventario de aeronaves y baterías, la administración del legajo digital de pilotos con validación de roles, el registro de mantenimientos correctivos/preventivos con impacto en el estado de la flota, y la planificación de operativos previstos (agenda). El proyecto sigue patrones avanzados de desarrollo y está optimizado para la interacción con Agentes de IA.

## 2. Tech Stack, Best Practices & Tools
* **Runtime Environment:** Node.js (ESM Modules - `"type": "module"`)
* **Web Framework:** Express.js (v5.1.0)
* **Database Driver:** mysql2 (v3.15.2) con soporte de promesas asíncronas
* **Authentication:** jsonwebtoken (v9.0.2) para sesiones stateless
* **Security & Encryption:** bcrypt (v6.0.0) para el hashing de credenciales
* **File Management:** multer (v2.0.2) para la subida de imágenes de la flota
* **AI Integration:** Configuración de MCP (Model Context Protocol) para VS Code y documentación contextualizada en `AGENTS.md`.
* **Standards implemented:** Node.js Backend Patterns y Node.js Best Practices para la resiliencia del servidor Express.

## 3. Project Architecture & Utilities
El sistema implementa una **Arquitectura de Capas para API REST (Router-Controller-Model)**:

* **Entry Point (`src/app.js`):** Instanciación de Express, middlewares globales (CORS, JSON parsing) y montajes de rutas bajo `/api` y `/auth`.
* **Configuration Layer (`src/config/database.js`):** Creación del pool de conexiones a MySQL en Railway (SSL configurado y `allowPublicKeyRetrieval: true`).
* **Utility Layer (`src/utils/`):** Incorporación de herramientas transversales como `dateHelper` para la manipulación uniforme de tiempos del sistema.
* **Routing Layer (`src/routes/`):** Definición de endpoints HTTP y acoplamiento de middlewares de control de acceso (`verificarToken`, `verificarAdmin`).
* **Business Logic Layer (`src/controllers/`):** Validación de payloads, control de flujos y sanitización de fechas (conversión inline mediante `formatFecha` para asegurar compatibilidad entre formatos ISO del cliente y el tipo `datetime` de MySQL).
* **Data Access Layer (`src/models/` o consultas embebidas):** Abstracción de persistencia mediante métodos asíncronos y queries SQL parametrizadas.

## 4. Database Schema & Persistence Strategy
El motor de base de datos relacional MySQL opera con las siguientes entidades:

1. **`piloto`:** Legajo y autenticación de personal (`id_pilotos`, `email` UNIQUE, `password` hash, `rol`).
2. **`dron`:** Inventario de aeronaves vinculadas a un piloto e integradas con tablas de modelos (`id_dron`, `matricula` UNIQUE, `estado`).
3. **`bateria`:** Fuentes de energía LiPo con soporte nativo de borrado lógico (`deleted_at`).
4. **`modelo_dron`:** Catálogo técnico estándar.
5. **`mantenimiento`:** Historial de taller técnico. Al insertar un registro, muta automáticamente el estado del dron a `'En Mantenimiento'`.
6. **`previstos`:** Planificación de misiones. Implementa una estrategia de **Soft Delete**; las eliminaciones no destruyen el registro físico, sino que actualizan el campo `deleted_at` con la marca de tiempo actual para preservar la integridad del histórico.

## 5. Security & Authentication Flow
1. **Password Hashing:** Encriptación irreversible de credenciales con `bcrypt` (factor de costo: 10).
2. **Login Procedure:** Validación de identidad y entrega de un JWT firmado con `JWT_SECRET` válido por 1 hora.
3. **Authorization Middlewares:** `verificarToken` (autenticidad y vigencia del payload) y `verificarAdmin` (restricción por rol para operaciones de escritura/mutación).

## 6. Current API Endpoints Map

### Auth Module
* `POST /auth/login` -> Autenticación pública de usuarios.

### Pilotos Module (Protegidos por Token)
* `GET /api/pilotos` -> Lista todos los pilotos.
* `GET /api/pilotos/search?nombre=...` -> Búsqueda parcial (`LIKE`).
* `GET /api/pilotos/:id_pilotos` -> Detalle por ID.
* `POST /api/pilotos` (Requiere Admin) -> Alta con hashing de clave.
* `PUT /api/pilotos/:id` (Requiere Admin) -> Actualización de perfil.
* `DELETE /api/pilotos/:id` (Requiere Admin) -> Remoción física.

### Drones Module (Protegidos por Token)
* `GET /api/drones` -> Flota completa con joins a modelos y pilotos.
* `GET /api/drones/:id` -> Detalle por ID.
* `POST /api/drones` (Requiere Admin) -> Alta de dron con soporte para imágenes (`multer`).
* `PUT /api/drones/:id` (Requiere Admin) -> Modificación técnica.
* `DELETE /api/drones/:id` (Requiere Admin) -> Remoción física.

### Baterías Module (Protegidos por Token)
* `GET /api/baterias` -> Lista componentes activos (`deleted_at IS NULL`).
* `POST /api/baterias` (Requiere Admin) -> Alta de batería.

### Mantenimiento Module (Protegidos por Token)
* `GET /api/mantenimientos` -> Historial de taller.
* `POST /api/mantenimientos` (Requiere Admin) -> Orden técnica y bloqueo de dron por mantenimiento.

### Previstos Module (Módulo Completado - Protegidos por Token)
* `GET /api/previstos` -> Lista los operativos planificados activos (`deleted_at IS NULL`).
* `GET /api/previstos/:id` -> Controlador `getPrevistoById`. Detalle exhaustivo de una planificación.
* `POST /api/previstos` -> Crea una nueva planificación de misión en agenda.
* `PUT /api/previstos/:id` -> Controlador `actualizarPrevisto`. Modificación de agenda con formateo de fechas ISO a MySQL datetime.
* `DELETE /api/previstos/:id` -> Controlador `borrarPrevisto`. Ejecuta un **Soft Delete** inyectando la fecha actual en `deleted_at`.

## 7. Active Roadmap & Context
Con la **Etapa 1 (Ciclo completo de Previstos)** finalizada con éxito, el foco de desarrollo actual se desplaza a la **Etapa 2: El Núcleo Operativo**. El objetivo inmediato es diseñar el módulo de **Vuelos Reales** y sus correspondientes controladores para las tablas intermedias (`vuelo_drones`, `vuelo_baterias`, `vuelo_pilotos`), lo que permitirá consolidar horas operativas reales y automatizar la sumatoria de ciclos de carga en las baterías en producción.