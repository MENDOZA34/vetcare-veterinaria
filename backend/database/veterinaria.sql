CREATE DATABASE IF NOT EXISTS veterinaria_db;
USE veterinaria_db;

DROP TABLE IF EXISTS historial_medico;
DROP TABLE IF EXISTS tratamientos;
DROP TABLE IF EXISTS citas;
DROP TABLE IF EXISTS mascotas;
DROP TABLE IF EXISTS veterinarios;
DROP TABLE IF EXISTS detalle_factura;
DROP TABLE IF EXISTS facturas;
DROP TABLE IF EXISTS inventario;
DROP TABLE IF EXISTS vacunas;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('administrador','recepcionista','veterinario','cliente') NOT NULL DEFAULT 'cliente',
  estado BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  direccion VARCHAR(150) NOT NULL,
  id_usuario INT NULL UNIQUE,
  CONSTRAINT fk_clientes_usuarios
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE mascotas (
  id_mascota INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  especie VARCHAR(50) NOT NULL,
  raza VARCHAR(50) NOT NULL,
  edad INT NOT NULL,
  sexo VARCHAR(20) NOT NULL,
  id_cliente INT NOT NULL,
  CONSTRAINT fk_mascotas_clientes
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE veterinarios (
  id_veterinario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  especialidad VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL
);

CREATE TABLE citas (
  id_cita INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  motivo VARCHAR(200) NOT NULL,
  estado ENUM('pendiente','atendida','cancelada') DEFAULT 'pendiente',
  id_cliente INT NOT NULL,
  id_mascota INT NOT NULL,
  id_veterinario INT NOT NULL,
  CONSTRAINT fk_citas_clientes
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_citas_mascotas
    FOREIGN KEY (id_mascota) REFERENCES mascotas(id_mascota)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_citas_veterinarios
    FOREIGN KEY (id_veterinario) REFERENCES veterinarios(id_veterinario)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE tratamientos (
  id_tratamiento INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  costo DECIMAL(10,2) NOT NULL,
  id_mascota INT NOT NULL,
  CONSTRAINT fk_tratamientos_mascotas
    FOREIGN KEY (id_mascota) REFERENCES mascotas(id_mascota)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE historial_medico (
  id_historial INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  diagnostico TEXT NOT NULL,
  observaciones TEXT NOT NULL,
  id_mascota INT NOT NULL,
  id_veterinario INT NOT NULL,
  CONSTRAINT fk_historial_mascotas
    FOREIGN KEY (id_mascota) REFERENCES mascotas(id_mascota)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_historial_veterinarios
    FOREIGN KEY (id_veterinario) REFERENCES veterinarios(id_veterinario)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE inventario (
  id_inventario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_producto VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descripcion TEXT,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  estado ENUM('Disponible','Agotado','Inactivo') DEFAULT 'Disponible',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vacunas (
  id_vacuna INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  dosis VARCHAR(100),
  frecuencia VARCHAR(100),
  precio DECIMAL(10,2) NOT NULL,
  estado ENUM('Disponible','Inactiva') DEFAULT 'Disponible',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE facturas (
  id_factura INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  id_cliente INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado ENUM('Pendiente','Pagada','Anulada') DEFAULT 'Pendiente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_facturas_clientes
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    ON UPDATE CASCADE
);

CREATE TABLE detalle_factura (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_factura INT NOT NULL,
  concepto VARCHAR(150) NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_detalle_factura_facturas
    FOREIGN KEY (id_factura) REFERENCES facturas(id_factura)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- La contrasena de todos los usuarios de prueba es: 123456
INSERT INTO usuarios (id_usuario, nombre, email, password, rol, estado) VALUES
(1, 'Administrador General', 'admin@vetcare.com', '$2b$10$CycTS5hLwLSpnS4TXWsA7ukYtbcdLrUCtd.dTFjtpgH6GjihcNdI.', 'administrador', TRUE),
(2, 'Recepcion General', 'recepcion@vetcare.com', '$2b$10$CycTS5hLwLSpnS4TXWsA7ukYtbcdLrUCtd.dTFjtpgH6GjihcNdI.', 'recepcionista', TRUE),
(3, 'Dra. Ana Lopez', 'ana@vetcare.com', '$2b$10$CycTS5hLwLSpnS4TXWsA7ukYtbcdLrUCtd.dTFjtpgH6GjihcNdI.', 'veterinario', TRUE),
(4, 'Cliente Demo', 'cliente@vetcare.com', '$2b$10$CycTS5hLwLSpnS4TXWsA7ukYtbcdLrUCtd.dTFjtpgH6GjihcNdI.', 'cliente', TRUE);

INSERT INTO clientes (id_cliente, nombre, telefono, email, direccion, id_usuario) VALUES
(1, 'Cliente Demo', '5555-5555', 'cliente@vetcare.com', 'Huehuetenango', 4),
(2, 'Maria Garcia', '4444-2222', 'maria@gmail.com', 'Zona 1', NULL),
(3, 'Carlos Perez', '3333-1111', 'carlos@gmail.com', 'Zona 5', NULL);

INSERT INTO mascotas (id_mascota, nombre, especie, raza, edad, sexo, id_cliente) VALUES
(1, 'Max', 'Perro', 'Labrador', 4, 'Macho', 1),
(2, 'Luna', 'Gato', 'Siames', 2, 'Hembra', 2),
(3, 'Toby', 'Perro', 'Poodle', 5, 'Macho', 3);

INSERT INTO veterinarios (id_veterinario, nombre, especialidad, telefono, email) VALUES
(1, 'Dra. Ana Lopez', 'Medicina general', '5550-1000', 'ana@vetcare.com'),
(2, 'Dr. Luis Ramirez', 'Cirugia veterinaria', '5550-2000', 'luis@vetcare.com'),
(3, 'Dra. Sofia Morales', 'Dermatologia animal', '5550-3000', 'sofia@vetcare.com');

INSERT INTO citas (fecha, hora, motivo, estado, id_cliente, id_mascota, id_veterinario) VALUES
('2026-05-20', '09:00:00', 'Vacunacion anual', 'pendiente', 1, 1, 1),
('2026-05-21', '10:30:00', 'Revision general', 'pendiente', 2, 2, 2),
('2026-05-22', '14:00:00', 'Consulta por alergia', 'pendiente', 3, 3, 3);

INSERT INTO tratamientos (nombre, descripcion, costo, id_mascota) VALUES
('Vacuna multiple', 'Aplicacion de vacuna anual para perro adulto.', 150.00, 1),
('Desparasitacion', 'Tratamiento oral para control de parasitos.', 80.00, 2),
('Crema dermatologica', 'Tratamiento topico por irritacion de piel.', 120.00, 3);

INSERT INTO historial_medico (fecha, diagnostico, observaciones, id_mascota, id_veterinario) VALUES
('2026-05-10', 'Mascota sana', 'Se recomienda control en seis meses.', 1, 1),
('2026-05-11', 'Parasitos leves', 'Aplicar desparasitante y revisar alimentacion.', 2, 2),
('2026-05-12', 'Dermatitis leve', 'Evitar shampoo irritante y aplicar tratamiento.', 3, 3);

INSERT INTO inventario (nombre_producto, categoria, descripcion, cantidad, precio_unitario, estado) VALUES
('Antibiotico veterinario', 'Medicamento', 'Antibiotico de amplio espectro para tratamientos indicados por veterinario.', 25, 95.00, 'Disponible'),
('Vacuna multiple canina', 'Vacuna', 'Vacuna anual para perros adultos.', 18, 150.00, 'Disponible'),
('Jeringas 5 ml', 'Insumo', 'Paquete de jeringas esteriles para procedimientos clinicos.', 80, 3.50, 'Disponible'),
('Shampoo dermatologico', 'Producto', 'Producto de cuidado para piel sensible.', 12, 85.00, 'Disponible'),
('Collares isabelinos', 'Otro', 'Collares protectores para recuperacion postoperatoria.', 0, 45.00, 'Agotado');

INSERT INTO vacunas (nombre, descripcion, dosis, frecuencia, precio, estado) VALUES
('Vacuna multiple canina', 'Proteccion anual para enfermedades virales comunes en perros.', '1 ml', 'Anual', 150.00, 'Disponible'),
('Vacuna antirrabica', 'Vacuna preventiva contra la rabia.', '1 ml', 'Anual', 100.00, 'Disponible'),
('Triple felina', 'Proteccion para enfermedades respiratorias y virales en gatos.', '1 ml', 'Anual', 140.00, 'Disponible'),
('Bordetella', 'Vacuna recomendada para perros con convivencia frecuente.', '1 ml', 'Cada 6 meses', 130.00, 'Disponible');

INSERT INTO facturas (id_factura, fecha, id_cliente, total, estado) VALUES
(1, '2026-05-20', 1, 250.00, 'Pagada'),
(2, '2026-05-21', 2, 220.00, 'Pendiente');

INSERT INTO detalle_factura (id_factura, concepto, cantidad, precio_unitario, subtotal) VALUES
(1, 'Vacuna multiple canina', 1, 150.00, 150.00),
(1, 'Consulta veterinaria', 1, 100.00, 100.00),
(2, 'Desparasitacion', 1, 80.00, 80.00),
(2, 'Triple felina', 1, 140.00, 140.00);
