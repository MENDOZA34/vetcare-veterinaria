# Sistema Web y API para Gestion de Veterinaria - VetCare

Proyecto academico para el curso **Analisis de Sistemas I**. VetCare es un sistema web con API REST para gestionar clientes, mascotas, veterinarios, citas, tratamientos, historial medico y portal cliente con control de roles.

Autor: Oscar Jesus Mendoza Pablo  
Correo: omendozap2@miumg.edu.gt

## Tecnologias

- Node.js
- Express
- MySQL
- HTML
- CSS
- JavaScript
- JWT
- bcryptjs

## Roles del sistema

- **administrador:** acceso total, usuarios internos, clientes, mascotas, veterinarios, citas, tratamientos, historial medico, reportes y configuracion.
- **recepcionista:** clientes, mascotas y citas.
- **veterinario:** citas asignadas, tratamientos e historial medico.
- **cliente:** portal privado para perfil, mascotas propias, solicitud de citas y citas propias.

## Como ejecutar localmente

1. Crear la base de datos ejecutando:

```sql
backend/database/veterinaria.sql
```

2. Configurar variables de entorno en `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=veterinaria_db
DB_PORT=3306
JWT_SECRET=clave_segura_vetcare
PORT=3000
```

3. Instalar dependencias y ejecutar backend:

```bash
cd backend
npm install
npm run dev
```

4. Abrir el frontend desde la carpeta `frontend/`, por ejemplo `frontend/index.html`.

La API principal queda en:

```text
http://localhost:3000/api/clientes
```

## Como iniciar sesion

Abrir `frontend/login.html`. Despues del login, el sistema redirige automaticamente segun el rol.

## Usuarios de prueba

Todos usan la contraseña:

```text
123456
```

| Rol | Email |
| --- | --- |
| administrador | admin@vetcare.com |
| recepcionista | recepcion@vetcare.com |
| veterinario | ana@vetcare.com |
| cliente | cliente@vetcare.com |

## Como probar el portal cliente

1. Iniciar sesion con `cliente@vetcare.com`.
2. Verificar redireccion a `frontend/portal-cliente.html`.
3. Registrar una mascota propia.
4. Solicitar una cita.
5. Consultar `Mis citas`.
6. Cancelar una cita pendiente.

El cliente no debe ver paneles internos ni listas generales de usuarios o clientes.

## Pantallas por rol

- `frontend/dashboard-admin.html`
- `frontend/dashboard-recepcion.html`
- `frontend/dashboard-veterinario.html`
- `frontend/portal-cliente.html`

## Endpoints nuevos

- `GET /api/portal/perfil`
- `GET /api/portal/mis-mascotas`
- `POST /api/portal/mis-mascotas`
- `PUT /api/portal/mis-mascotas/:id`
- `GET /api/portal/mis-citas`
- `POST /api/portal/mis-citas`
- `PUT /api/portal/mis-citas/:id/cancelar`
- `GET /api/usuarios`
- `POST /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`

## Documentos Word

Los documentos para entrega estan en:

```text
documentacion_word/
```

Incluye:

- `01_Analisis_de_Requisitos_VetCare.docx`
- `02_Casos_de_Uso_y_Tablas_VetCare.docx`
- `03_Especificacion_Requisitos_Software_ERS_VetCare.docx`
- `04_Arquitectura_4mas1_VetCare.docx`
- `05_Anexos_VetCare.docx`

Tambien existen versiones Markdown de respaldo en la misma carpeta.

## Como generar documentos Word

En esta version los documentos se generaron con Node.js:

```bash
node tools/generar_documentos_word.js
```

Tambien se deja un script Python equivalente para convertir los Markdown a `.docx` cuando Python este disponible:

```bash
python tools/generar_documentos_word.py
```

## UML

Los diagramas PlantUML estan en:

```text
uml/
```

Archivos principales:

- `caso_uso_general_vetcare.puml`
- `caso_uso_login_vetcare.puml`
- `caso_uso_admin_vetcare.puml`
- `caso_uso_recepcion_vetcare.puml`
- `caso_uso_veterinario_vetcare.puml`
- `caso_uso_cliente_vetcare.puml`
- `modelo_dominio_vetcare.puml`
- `modelo_er_veterinaria.puml`
- `vista_logica_diagrama_clases.puml`
- `vista_desarrollo_paquetes.puml`
- `vista_fisica_despliegue.puml`
- `vista_escenarios_casos_uso.puml`

Para convertir a imagen se puede usar PlantUML:

```bash
plantuml uml/*.puml
```

## Despliegue en Railway y Netlify

1. Crear proyecto backend en Railway.
2. Agregar servicio MySQL en Railway.
3. Importar `backend/database/veterinaria.sql`.
4. Configurar variables `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `JWT_SECRET` y `PORT`.
5. Subir frontend a Netlify.
6. Cambiar `frontend/js/config.js` para que `API_BASE_URL` apunte a la URL publica de Railway.
7. Probar login y permisos de los cuatro roles.
