# ERP-Lite – Frontend

Frontend moderno del sistema **ERP-Lite**, construido con React + TypeScript, usando un diseño oscuro + coral, manejo de sesión vía JWT, React Query para datos y un layout profesional pensado para entrevistas técnicas.

---

## 🚀 Stack Tecnológico

- **React 18 + Vite**
- **TypeScript**
- **Material UI (MUI)**
- **React Query** (manejo de datos y caché)
- **React Router v6**
- **Recharts** (gráficos)
- **Axios** (cliente HTTP)

---

## 📦 Requisitos

- **Node.js 18 o superior**
- Backend corriendo en:  
  `http://localhost:8081`

⚠️ Si usás proxy de Vite, no hace falta configurar URL manual.

---

## 🔧 Configuración del entorno

1. Copiar:

```
.env.example → .env
```

2. Si estás usando el proxy de Vite, dejar:

```
VITE_API_BASE_URL=
```

Esto permite que todas las llamadas a `/api` vayan a `http://localhost:8081` automáticamente.

---

## 🏃 Scripts disponibles

| Comando               | Descripción                           |
|----------------------|----------------------------------------|
| `npm i`              | Instalar dependencias                  |
| `npm run dev`        | Levantar entorno de desarrollo         |
| `npm run build`      | Compilar para producción               |
| `npm run preview`    | Previsualizar build de producción      |

---

## 🗂️ Estructura del proyecto

```
src/
│
├── api/                 # Endpoints y cliente HTTP (Axios)
├── components/          # UI components
├── context/             # AuthContext y proveedor de sesión
├── hooks/               # Hooks reutilizables
├── pages/               # Pantallas: Login, Dashboard, Sales, etc
├── theme/               # theme.ts + tokens del tema
├── utils/               # formateo ARS, helpers
└── config.ts            # Base URL y configuración global
```

---

## 🔑 Autenticación

- Login obtiene el JWT.
- Token se almacena en localStorage.
- Interceptor agrega:  
  `Authorization: Bearer <token>`
- Ante `401`, se ejecuta **logout automático**.

---

## 📊 Características destacadas

- Dashboard con KPIs, ventas recientes y gráfico.
- Filtros de ventas que persisten en querystring.
- Exportación de **CSV** y **PDF** respetando filtros.
- Tema **oscuro + coral** profesional.
- Layout modular y extensible para entrevistas técnicas.

---

## 📝 Notas finales

- Todo el proyecto está preparado para integrarse con el backend ERP-Lite.
- El tema visual y el layout están optimizados para presentaciones y portafolio.

---

## 👤 Autor

**Tiago Frencia**  
Desarrollador Full-Stack – ERP-Lite  
Río Cuarto, Córdoba – Argentina
