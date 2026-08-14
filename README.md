# 🎨 Marketplace Inmobiliario - Frontend App (Angular 19 SSR)

Aplicación web moderna y reactiva desarrollada con **Angular 19**, **Tailwind CSS** y **Server-Side Rendering (SSR)** para la plataforma Marketplace de Alquileres White-Label. Incluye un catálogo público optimizado y un Panel de Administración con autenticación JWT y subida directa de archivos a Cloudinary.

---

## 🛠️ Tecnologías y Arquitectura

- **Framework:** Angular 19 (Standalone Components Architecture)
- **Renderizado:** Server-Side Rendering (SSR) con `@angular/ssr` / Node.js Engine
- **Estilos:** Tailwind CSS v3 con diseño adaptativo Dark/Light Mode, glassmorphism y animaciones fluidas
- **Estado & Reactividad:** Angular Signals & RxJS Observables
- **Control Flow:** Nueva sintaxis moderna de Angular 17+ (`@if`, `@for`, `@switch`, `@empty`)
- **Seguridad:**
  - `authInterceptor`: Interceptor HTTP funcional que inyecta tokens JWT Bearer compatibles con SSR (`isPlatformBrowser`).
  - `authGuard`: Guardián de rutas funcional (`CanActivateFn`) con redirección a `/admin/login`.
- **Multimedia:** Integración con Cloudinary (`UploadService`) para subida directa de imágenes con spinner interactivo y vista previa.

---

## 💻 Desarrollo Local

### Requisitos Previos
- [Node.js](https://nodejs.org/) v20+ o v22+
- npm v10+

### Pasos para Ejecutar
1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo local (Puerto 4200):
   ```bash
   npm start
   ```
3. Navega en tu navegador a `http://localhost:4200`.

---

## 🚀 Despliegue Oficial en Vercel

La aplicación está completamente optimizada para desplegarse en **Vercel** aprovechando las capacidades de renderizado SSR en el Edge.

### Pasos de Configuración en Vercel:

1. Importa el repositorio desde tu cuenta de GitHub en [Vercel Dashboard](https://vercel.com).
2. Configura los parámetros del proyecto:
   - **Framework Preset:** `Angular`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/frontend`

### 🔑 Variables de Entorno en Vercel
En la sección **Environment Variables** de Vercel, agrega las siguientes variables para conectar el frontend SSR con la API backend alojada en Northflank:

| Variable | Valor de Ejemplo / Descripción |
| :--- | :--- |
| `API_INTERNAL_URL` | `https://api-paysandu.northflank.app/api` |
| `NG_APP_API_URL` | `https://api-paysandu.northflank.app/api` |

---

## 📸 Capturas de Pantalla

### 📱 Catálogo Público y Filtros Inmobiliarios
![Catálogo Público](https://raw.githubusercontent.com/username/repository/main/docs/screenshots/public-marketplace.png)

### 🔐 Panel de Administración - Dashboard CRUD
![Dashboard de Administración](https://raw.githubusercontent.com/username/repository/main/docs/screenshots/admin-dashboard.png)

### ☁️ Formulario de Publicación y Subida Cloudinary
![Formulario con Subida Cloudinary](https://raw.githubusercontent.com/username/repository/main/docs/screenshots/property-form-upload.png)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
