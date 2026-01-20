# 🚀 SIGUIENTE PASO CRÍTICO

## ⚠️ IMPORTANTE: El dashboard está desplegado pero NO FUNCIONARÁ hasta que completes este paso

**URL del Dashboard**: https://paulamen.github.io/LINEAMIENTOS/

Actualmente verás un mensaje de error porque falta configurar el backend.

---

## 📋 CONFIGURACIÓN DEL BACKEND (5-10 minutos)

### PASO 1: Crear el Apps Script

1. **Abre Google Apps Script**
   ```
   https://script.google.com/
   ```

2. **Crea un nuevo proyecto**
   - Haz clic en "Nuevo proyecto" (botón azul superior izquierdo)

3. **Copia el código**
   - Abre el archivo `Code.gs` de este repositorio
   - Selecciona TODO el contenido (Ctrl+A)
   - Cópialo (Ctrl+C)

4. **Pega en Apps Script**
   - En el editor de Apps Script, selecciona todo el código existente
   - Pégalo (Ctrl+V) para reemplazarlo

5. **Guarda el proyecto**
   - Presiona Ctrl+S
   - Ponle un nombre: "Backend Dashboard UNESUM"

---

### PASO 2: Probar y Autorizar

1. **Selecciona la función de prueba**
   - En el menú desplegable superior, selecciona: `testProcesarDatos`

2. **Ejecuta la función**
   - Haz clic en el botón "Ejecutar" (▶️)

3. **Autoriza los permisos** (solo la primera vez)
   - Haz clic en "Revisar permisos"
   - Selecciona tu cuenta de Google
   - Aparecerá un aviso "Esta aplicación no está verificada"
   - Haz clic en "Avanzado" (esquina inferior izquierda)
   - Haz clic en "Ir a Backend Dashboard UNESUM (no seguro)"
   - Haz clic en "Permitir"

4. **Verifica que funcionó**
   - Ve a "Ver" → "Registros" (o presiona Ctrl+Enter)
   - Deberías ver un JSON con datos de los semestres

---

### PASO 3: Desplegar como Web App

1. **Haz clic en "Implementar"** (esquina superior derecha)

2. **Selecciona "Nueva implementación"**

3. **Configura el tipo**
   - Haz clic en el ícono de engranaje ⚙️ junto a "Seleccionar tipo"
   - Selecciona "Aplicación web"

4. **Configura los permisos**
   - **Descripción**: "API Dashboard Educativo v1"
   - **Ejecutar como**: "Yo"
   - **Quién tiene acceso**: "Cualquier persona" ← ¡MUY IMPORTANTE!

5. **Despliega**
   - Haz clic en "Implementar"
   - Espera unos segundos...

6. **COPIA LA URL** ← ¡PASO CRÍTICO!
   - Aparecerá una URL como:
     ```
     https://script.google.com/macros/s/AKfycbyXXXXXXXXXXXXXXXXX/exec
     ```
   - **COPIA ESTA URL COMPLETA** (hasta /exec)
   - Guárdala temporalmente (Notepad, bloc de notas, etc.)

---

### PASO 4: Actualizar el Frontend

1. **Edita el archivo de configuración**
   ```bash
   cd /home/paul/Projects/LINEAMIENTOS
   nano src/config.ts
   ```
   (O ábrelo con tu editor favorito)

2. **Reemplaza la URL**
   
   **ANTES:**
   ```typescript
   export const APPS_SCRIPT_URL = 'TU_URL_DE_APPS_SCRIPT_AQUI';
   ```

   **DESPUÉS:**
   ```typescript
   export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```
   (Pega la URL que copiaste)

3. **Guarda el archivo**
   - Si usas nano: Ctrl+O, Enter, Ctrl+X
   - Si usas VS Code: Ctrl+S

---

### PASO 5: Desplegar la Actualización

```bash
cd /home/paul/Projects/LINEAMIENTOS
git add src/config.ts
git commit -m "Configurar URL de Google Apps Script"
git push
```

---

### PASO 6: Esperar el Deploy Automático

1. **Monitorear el deploy**
   ```bash
   gh run watch
   ```
   (Espera 2-3 minutos)

2. **O verlo en el navegador**
   - Ve a: https://github.com/PaulAmen/LINEAMIENTOS/actions
   - Espera a que el círculo amarillo se vuelva verde ✅

---

### PASO 7: ¡Verificar que Funciona!

1. **Abre el dashboard**
   ```
   https://paulamen.github.io/LINEAMIENTOS/
   ```

2. **Deberías ver:**
   - ✅ Un gráfico de barras apiladas con datos
   - ✅ Filtros de semestre (Sexto, Séptimo, Octavo)
   - ✅ Filtros de dimensiones educativas
   - ✅ Datos numéricos reales de tu Google Sheet

3. **Si ves un error:**
   - Presiona F12 para abrir la consola del navegador
   - Busca errores en rojo
   - Verifica que la URL del Apps Script sea correcta
   - Verifica que el Apps Script esté desplegado con acceso "Cualquier persona"

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Debes configurar APPS_SCRIPT_URL"
- No actualizaste `src/config.ts` correctamente
- Verifica que la URL esté entre comillas simples
- Asegúrate de haber hecho `git push`

### Error: "Failed to fetch" o "CORS error"
- El Apps Script no está desplegado correctamente
- Vuelve a Apps Script y verifica que:
  - Esté desplegado como "Aplicación web"
  - "Quién tiene acceso" esté en "Cualquier persona"
  - Si aún falla, crea una nueva implementación

### No se muestran datos / JSON vacío
- Verifica el `SHEET_ID` en `Code.gs` (línea 23)
- Verifica el `SHEET_NAME` en `Code.gs` (línea 24)
- Ejecuta `testProcesarDatos` y revisa los logs

---

## ✅ CHECKLIST FINAL

- [ ] Apps Script creado y código pegado
- [ ] Función `testProcesarDatos` ejecutada correctamente
- [ ] Apps Script desplegado como Web App
- [ ] URL copiada del Apps Script
- [ ] Archivo `src/config.ts` actualizado con la URL
- [ ] Cambios commiteados y pusheados a GitHub
- [ ] GitHub Actions completó exitosamente
- [ ] Dashboard muestra datos correctamente en https://paulamen.github.io/LINEAMIENTOS/

---

## 📞 ¿NECESITAS AYUDA?

Si algo no funciona después de seguir estos pasos:

1. Abre la consola del navegador (F12)
2. Captura pantalla del error
3. Revisa el archivo `INSTRUCCIONES_DESPLIEGUE.md` para más detalles

---

**Tiempo estimado total**: 8-12 minutos

**Una vez completado, tu dashboard estará 100% funcional y actualizado automáticamente desde Google Sheets.**
