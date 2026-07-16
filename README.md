# 📷 Nuestra Galería — Yeray & Silvia

Galería de fotos privada con login, organizada por meses y años, con calendario de posts y subida de fotos.

## Características

- 🔐 Login privado (Yeray / Silvia)
- 📅 Organización por año y mes
- 📝 Posts con título, descripción y hasta 10 fotos
- 🗓️ Calendario visual con acceso rápido a posts
- 🖼️ Lightbox para ver fotos a pantalla completa
- 💾 Datos guardados en localStorage (sin servidor)
- 🚀 Deploy en GitHub Pages

## Cómo desplegar en GitHub Pages

### 1. Crear repositorio en GitHub

Crea un repositorio llamado exactamente `photo-gallery` en tu cuenta de GitHub.

### 2. Inicializar git y conectar

```bash
cd photo-gallery
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/photo-gallery.git
git push -u origin main
```

### 3. Publicar en GitHub Pages

```bash
npm run deploy
```

Esto compila la app y sube la carpeta `dist` a la rama `gh-pages`.

### 4. Activar GitHub Pages

En tu repositorio de GitHub:
- Settings → Pages
- Source: **Deploy from a branch**
- Branch: **gh-pages** / **(root)**
- Guardar

Tras unos minutos la app estará disponible en:
**https://TU_USUARIO.github.io/photo-gallery/**

## Desarrollo local

```bash
npm install
npm run dev
```

## Credenciales

| Usuario | Contraseña |
|---------|-----------|
| Yeray   | Admin      |
| Silvia  | Mongola.13 |

> ⚠️ Las contraseñas están en el código fuente. Esta app es solo para uso personal/privado.

## Nota sobre el almacenamiento

Las fotos se guardan en `localStorage` como base64, lo que tiene un límite de ~5–10MB dependiendo del navegador. Para uso con muchas fotos de alta resolución, considera comprimir las imágenes antes de subirlas.
