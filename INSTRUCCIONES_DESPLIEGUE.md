# Instrucciones de Despliegue - Dashboard Educativo UNESUM

## Guía Rápida de Inicio (15 minutos)

### Parte 1: Configurar Google Apps Script (5 minutos)

1. **Abre Google Apps Script**
   - Ve a https://script.google.com/
   - Inicia sesión con tu cuenta de Google

2. **Crea un nuevo proyecto**
   - Haz clic en "Nuevo proyecto"
   - El editor se abrirá con un archivo `Code.gs`

3. **Copia el código del backend**
   - Abre el archivo `Code.gs` de este repositorio
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)
   - Pega en el editor de Apps Script, reemplazando el código existente

4. **Configura el ID del Sheet**
   - En la línea 23, verifica que esté:
   ```javascript
   const SHEET_ID = '1gTUShHOJ5jlN5JBEais547zwYO3jzHL2rBJ3aR6UZek';
   ```

5. **Guarda el proyecto**
   - Ctrl+S o haz clic en el icono de disquete
   - Ponle un nombre: "Backend Dashboard UNESUM"

6. **Prueba el script (IMPORTANTE)**
   - En el menú desplegable de funciones, selecciona `testProcesarDatos`
   - Haz clic en "Ejecutar" (▶️)
   - **Primera vez**: Te pedirá permisos:
     * Haz clic en "Revisar permisos"
     * Selecciona tu cuenta
     * Haz clic en "Avanzado"
     * Haz clic en "Ir a Backend Dashboard UNESUM (no seguro)"
     * Haz clic en "Permitir"
   - Abre "Ver" → "Registros" para verificar que el JSON se generó correctamente

7. **Despliega como Web App**
   - Haz clic en "Implementar" → "Nueva implementación"
   - Haz clic en el ícono de engranaje ⚙️ junto a "Seleccionar tipo"
   - Selecciona "Aplicación web"
   - Configura:
     * **Descripción**: "API Dashboard Educativo v1"
     * **Ejecutar como**: "Yo"
     * **Quién tiene acceso**: "Cualquier persona"
   - Haz clic en "Implementar"
   - **COPIA LA URL** que aparece (ej: `https://script.google.com/macros/s/AKfycby...abc123.../exec`)
   - Guárdala en algún lugar (Notepad, etc.)

### Parte 2: Configurar el Proyecto Frontend (3 minutos)

1. **Instala Node.js si no lo tienes**
   - Descarga desde https://nodejs.org/
   - Versión recomendada: LTS (20.x)

2. **Abre una terminal en la carpeta del proyecto**
   ```bash
   cd /ruta/a/LINEAMIENTOS
   ```

3. **Instala las dependencias**
   ```bash
   npm install
   ```
   (Esto tomará 1-2 minutos)

4. **Configura la URL del Apps Script**
   - Abre `src/config.ts`
   - Reemplaza `TU_URL_DE_APPS_SCRIPT_AQUI` con la URL que copiaste antes:
   ```typescript
   export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby...abc123.../exec';
   ```
   - Guarda el archivo

5. **Prueba en local (opcional pero recomendado)**
   ```bash
   npm run dev
   ```
   - Abre http://localhost:4321 en tu navegador
   - Deberías ver el dashboard con los datos cargados
   - Presiona Ctrl+C para detener el servidor

### Parte 3: Desplegar en GitHub Pages (7 minutos)

#### Opción A: Si ya tienes una cuenta de GitHub

1. **Crea un repositorio en GitHub**
   - Ve a https://github.com/new
   - Nombre del repositorio: `LINEAMIENTOS`
   - Visibilidad: Public
   - NO marques ningún checkbox (sin README, sin .gitignore)
   - Haz clic en "Create repository"

2. **Actualiza el archivo de configuración de Astro**
   - Abre `astro.config.mjs`
   - Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub:
   ```javascript
   export default defineConfig({
     site: 'https://TU_USUARIO.github.io',  // ← Cambia TU_USUARIO
     base: '/LINEAMIENTOS',
     // ...
   });
   ```
   - Guarda el archivo

3. **Sube el código a GitHub**
   ```bash
   git add .
   git commit -m "Configurar URLs para producción"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/LINEAMIENTOS.git
   git push -u origin main
   ```

4. **Habilita GitHub Pages**
   - Ve a tu repositorio en GitHub
   - Haz clic en "Settings" (Configuración)
   - En el menú lateral, haz clic en "Pages"
   - En "Source", selecciona **"GitHub Actions"** (NO "Deploy from a branch")
   - ¡No necesitas hacer clic en "Save", se guarda automáticamente!

5. **Espera el deploy automático**
   - Haz clic en la pestaña "Actions" de tu repositorio
   - Verás un workflow ejecutándose (círculo amarillo 🟡)
   - Espera 2-3 minutos hasta que se ponga verde ✅
   - Si falla (❌), haz clic en el workflow y revisa los logs

6. **Accede a tu dashboard**
   - Una vez completado, tu dashboard estará en:
   ```
   https://TU_USUARIO.github.io/LINEAMIENTOS/
   ```
   - Ábrelo en el navegador y verifica que funcione

#### Opción B: Si NO tienes cuenta de GitHub

1. **Crea una cuenta gratis**
   - Ve a https://github.com/signup
   - Completa el registro
   - Luego sigue los pasos de la Opción A

---

## Solución de Problemas Comunes

### ❌ Error: "Debes configurar APPS_SCRIPT_URL"

**Solución:**
- Verifica que editaste `src/config.ts`
- Asegúrate de que la URL esté entre comillas
- Verifica que no haya espacios extra
- Reconstruye el proyecto: `npm run build`

### ❌ El gráfico no carga / Pantalla en blanco

**Solución:**
1. Abre la consola del navegador (F12 o clic derecho → Inspeccionar)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Si dice "Failed to fetch" o "CORS error":
   - Verifica que el Apps Script esté desplegado con acceso "Cualquier persona"
   - Vuelve a desplegar el Apps Script (nueva versión)

### ❌ GitHub Actions falla en el deploy

**Solución:**
1. Ve a Actions → Haz clic en el workflow fallido
2. Revisa los logs de error
3. Errores comunes:
   - **"base" configuration error**: Verifica que `astro.config.mjs` tenga `base: '/LINEAMIENTOS'`
   - **Build fails**: Ejecuta `npm run build` localmente para ver el error exacto
   - **Permissions error**: Ve a Settings → Actions → General → Workflow permissions → Marca "Read and write permissions"

### ❌ Los datos no coinciden con el Sheet

**Solución:**
1. Abre el editor de Apps Script
2. Ejecuta la función `testProcesarDatos`
3. Revisa los logs (Ver → Registros)
4. Verifica:
   - Que el `SHEET_ID` sea correcto
   - Que el `SHEET_NAME` coincida con el nombre de la pestaña del Sheet
   - Que las columnas tengan los nombres esperados

### ❌ No veo algunos semestres o dimensiones

**Solución:**
- Asegúrate de que todos los filtros estén activos (haz clic en "Todos")
- Verifica que el Sheet tenga datos para esos semestres
- Ejecuta `testProcesarDatos` en Apps Script para ver qué datos se están procesando

---

## Actualizaciones Futuras

### Para actualizar los datos del dashboard

1. Simplemente edita el Google Sheet
2. El dashboard se actualizará automáticamente al recargar
3. **NO necesitas redesplegar nada**

### Para actualizar el código del frontend

1. Haz cambios en los archivos del proyecto
2. Guarda los cambios
3. Haz commit y push:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push
   ```
4. GitHub Actions desplegará automáticamente

### Para actualizar el código del backend (Apps Script)

1. Edita el código en el editor de Apps Script
2. Guarda (Ctrl+S)
3. Ve a "Implementar" → "Administrar implementaciones"
4. Haz clic en el ícono de lápiz ✏️ de la implementación activa
5. Haz clic en "Nueva versión"
6. Haz clic en "Implementar"
7. **NO necesitas cambiar la URL**, sigue siendo la misma

---

## Checklist de Verificación Final

Antes de considerar el proyecto completo, verifica:

- [ ] El Apps Script está desplegado y devuelve JSON válido
- [ ] El archivo `src/config.ts` tiene la URL correcta del Apps Script
- [ ] El archivo `astro.config.mjs` tiene tu usuario de GitHub correcto
- [ ] El repositorio está creado en GitHub
- [ ] GitHub Pages está habilitado con "GitHub Actions"
- [ ] El workflow de GitHub Actions completó exitosamente
- [ ] El dashboard es accesible en `https://TU_USUARIO.github.io/LINEAMIENTOS/`
- [ ] Los datos se cargan correctamente
- [ ] Los filtros funcionan (semestres y dimensiones)
- [ ] El gráfico es visible y responsive

---

## Contacto y Soporte

Si tienes problemas que no puedes resolver:

1. Revisa la sección de Troubleshooting arriba
2. Verifica los logs de la consola del navegador (F12)
3. Revisa los logs de GitHub Actions si el deploy falla
4. Revisa los logs del Apps Script (Ver → Registros) si hay problemas de datos

**Repositorio del proyecto**: https://github.com/TU_USUARIO/LINEAMIENTOS

---

¡Listo! Tu Dashboard Educativo UNESUM está funcionando.
