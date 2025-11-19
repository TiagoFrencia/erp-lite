# ERP-Lite – Backend

Backend del sistema ERP-Lite, una API REST moderna para la gestión de productos, stock, ventas y clientes, con autenticación JWT y arquitectura limpia en Spring Boot 3. Incluye paginación uniforme, exportación de reportes y un flujo de ventas completo con validación de stock.

---

## 🚀 Funcionalidades principales

- CRUD completo de productos y clientes
- Registro de ventas con ítems, subtotal por producto y total general
- Descuento automático de stock
- Paginación uniforme con PageResponse<T>
- Filtros avanzados (cliente, fecha, monto)
- Exportación de CSV y PDF
- Dashboard con KPIs + ventas recientes + datos para gráficos
- Autenticación y autorización vía JWT stateless
- Global ApiExceptionHandler para manejo consistente de errores
- Swagger UI para documentación de endpoints
- Seeds automáticos en perfil DEV

---

## 🧩 Tecnologías utilizadas

- Java 21
- Spring Boot 3.5.x
- Spring Web / Spring Security 6 / JWT
- Spring Data JPA (Hibernate)
- PostgreSQL + HikariCP
- springdoc-openapi (Swagger)
- OpenPDF (PDF)
- Docker Compose

---

## 📦 Ejecutar con Docker Compose (RECOMENDADO)

```bash
docker compose up --build -d
```

### Servicios disponibles

| Servicio    | URL                                      |
|-------------|-------------------------------------------|
| Backend API | http://localhost:8081                     |
| Swagger UI  | http://localhost:8081/swagger-ui.html     |
| PostgreSQL  | localhost:5432                            |
| PgAdmin     | http://localhost:5050                     |

---

## 🔑 Roles disponibles

- ADMIN
- USER

---

## 📚 Endpoints principales

### Auth
| Método | Endpoint        | Descripción     |
|--------|-----------------|------------------|
| POST   | /api/auth/login | Autenticación    |
| GET    | /api/auth/me    | Perfil actual    |

### Productos
| Método | Endpoint                | Descripción         |
|--------|--------------------------|---------------------|
| GET    | /api/products           | Listar productos    |
| POST   | /api/products           | Crear producto      |
| PUT    | /api/products/{id}      | Editar producto     |
| GET    | /api/products/low-stock | Alerta stock bajo   |

### Clientes
| Método | Endpoint            | Descripción       |
|--------|----------------------|-------------------|
| GET    | /api/customers      | Listar clientes   |
| POST   | /api/customers      | Crear cliente     |
| PUT    | /api/customers/{id} | Editar cliente    |

### Ventas
| Método | Endpoint              | Descripción               |
|--------|------------------------|---------------------------|
| GET    | /api/sales            | Listar ventas con filtros |
| POST   | /api/sales            | Registrar venta           |
| GET    | /api/sales/{id}       | Obtener venta             |
| GET    | /api/sales/export/csv | Export CSV                |
| GET    | /api/sales/export/pdf | Export PDF                |

### Dashboard
| Método | Endpoint                    | Descripción         |
|--------|------------------------------|----------------------|
| GET    | /api/dashboard/summary      | KPIs                |
| GET    | /api/dashboard/recent-sales | Últimas ventas      |
| GET    | /api/dashboard/sales-chart  | Datos del gráfico   |

---

## 🗂️ Estructura del proyecto

src/main/java/com/tiago/erp
│
├── api/           # DTOs públicos
├── config/        # Configuración general
├── controller/    # Controladores REST
├── dto/           # DTOs internos
├── exception/     # ApiExceptionHandler + modelos de error
├── model/         # Entidades JPA
├── repository/    # Repositorios
├── security/      # JWT + SecurityConfig
├── service/       # Lógica de negocio
└── spec/          # Specifications dinámicas

---

## 👤 Autor

Tiago Frencia  
Desarrollador Full-Stack – ERP-Lite  
Río Cuarto, Córdoba – Argentina
