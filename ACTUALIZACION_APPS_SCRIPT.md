# ⚠️ ACTUALIZACIÓN IMPORTANTE - Google Apps Script

## Problema Detectado y Resuelto

**Error anterior:**
```
TypeError: ContentService.createTextOutput(...).setMimeType(...).setHeaders is not a function
```

**Causa:** 
Google Apps Script no soporta el método `.setHeaders()` en ContentService.

**Solución:**
El archivo `Code.gs` ha sido actualizado y simplificado.

---

## 🔄 SI YA DESPLEGASTE EL APPS SCRIPT ANTERIORMENTE:

### Opción A: Actualizar el código existente (Recomendado)

1. **Abre tu proyecto en Apps Script**
   - Ve a https://script.google.com/
   - Abre el proyecto "Backend Dashboard UNESUM" (o como lo hayas llamado)

2. **Reemplaza el código**
   - Abre el archivo `Code.gs` de este repositorio (actualizado)
   - Selecciona TODO el código en el editor de Apps Script
   - Pega el nuevo código (Ctrl+V)

3. **Guarda**
   - Ctrl+S o clic en el icono de disquete

4. **NO necesitas crear una nueva implementación**
   - El mismo URL seguirá funcionando
   - Los cambios se aplican automáticamente

5. **Prueba (opcional)**
   - Selecciona la función `testProcesarDatos`
   - Haz clic en "Ejecutar" ▶️
   - Verifica en los logs que funciona

---

### Opción B: Nueva implementación

Si prefieres crear una nueva implementación desde cero:

1. Sigue las instrucciones completas en `SIGUIENTE_PASO.md`
2. Usa el nuevo archivo `Code.gs` actualizado
3. Actualiza `src/config.ts` con la nueva URL
4. Haz `git push`

---

## 🆕 SI AÚN NO HAS DESPLEGADO EL APPS SCRIPT:

✅ **Buenas noticias:** Usa el archivo `Code.gs` actualizado

Sigue las instrucciones en `SIGUIENTE_PASO.md` normalmente. El código ya está corregido.

---

## ✅ Cambios Técnicos Realizados

**Antes:**
```javascript
return ContentService
  .createTextOutput(JSON.stringify(datos))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeaders({  // ❌ NO FUNCIONA
    'Access-Control-Allow-Origin': '*'
  });
```

**Después:**
```javascript
return ContentService
  .createTextOutput(JSON.stringify(datos))
  .setMimeType(ContentService.MimeType.JSON);
// ✅ CORS funciona automáticamente al desplegar como "Cualquier persona"
```

---

## 🔍 Verificación

Después de actualizar el código:

1. **Abre el dashboard:**
   https://paulamen.github.io/LINEAMIENTOS/

2. **Deberías ver:**
   - ✅ Gráfico con datos cargados
   - ✅ Filtros funcionando
   - ✅ Sin errores en consola (F12)

3. **Si ves error:**
   - Verifica que copiaste TODO el archivo Code.gs
   - Verifica que guardaste en Apps Script
   - Espera 1-2 minutos (cache de Google)
   - Recarga la página con Ctrl+Shift+R

---

## 📝 Nota Técnica

Google Apps Script permite CORS automáticamente cuando:
- El script se despliega como "Aplicación web"
- "Quién tiene acceso" está configurado como "Cualquier persona"

No es necesario configurar headers manualmente.

---

**Archivo actualizado:** `Code.gs`  
**Commit:** `85f4722`  
**Fecha:** 2026-01-20

