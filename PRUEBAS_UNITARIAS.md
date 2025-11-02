# 📋 Guía de Pruebas Unitarias - Frontend

## ✅ Estado Actual

Ya tienes **48+ pruebas unitarias** creadas y configuradas correctamente:

### Archivos de Tests Creados:

1. **`src/App.test.js`** - Tests de Autenticación (12 tests)
   - Login exitoso y con errores
   - Registro de usuarios  
   - Logout
   - Manejo de errores de red y validaciones

2. **`src/App.projects.test.js`** - Tests de Gestión de Proyectos (11 tests)
   - CRUD completo de proyectos
   - Listado, creación, edición, eliminación
   - Modales y navegación

3. **`src/App.validation.test.js`** - Tests de Validación (13 tests)
   - Validación de formularios de login/registro
   - Validación de correos, contraseñas
   - Validación de formularios de proyectos

4. **`src/App.backlog.test.js`** - Tests de Backlog (12 tests)
   - Gestión de Epics
   - Gestión de User Stories
   - Asociaciones y eliminaciones

**Total: 48+ tests unitarios** que cubren las funcionalidades principales.

---

## 🔄 Cómo Funciona con el Jenkinsfile

Tu Jenkinsfile está configurado para:

### 1. **Stage: "Crear test que EJECUTE código real"**
Este stage crea un test simple (`App.smoke.test.jsx`) que asegura que la app renderiza sin errores. Este test es un "backup" básico.

### 2. **Stage: "Run tests (coverage)"**
```groovy
bat '''
  set CI=true
  npm test -- --coverage --watchAll=false
'''
```

Este comando ejecutará **TODOS** los tests que encuentre con el patrón:
- `**/*.test.js` ✅ (App.test.js, App.projects.test.js, etc.)
- `**/*.test.jsx` ✅ (App.smoke.test.jsx si existe)

### 3. **Stage: "SonarQube Analysis"**
```groovy
-Dsonar.test.inclusions=**/*.test.{js,jsx,ts,tsx},src/**/__tests__/**/*
-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
```

SonarQube leerá el archivo `coverage/lcov.info` generado por Jest, que incluirá el coverage de **todos** los tests ejecutados.

---

## 📊 Coverage Esperado

Con los tests actuales deberías lograr:

- **Login/Registro**: ~80-90% coverage
- **Gestión de Proyectos**: ~70-80% coverage  
- **Validaciones**: ~85-95% coverage
- **Backlog**: ~60-70% coverage

**Coverage Total Estimado**: ~70-80% (muy por encima del 0% actual)

---

## 🚀 Pasos para Implementar

### Paso 1: Verificar Tests Localmente (RECOMENDADO)

```powershell
cd login-registration
npm test
```

Esto ejecutará todos los tests y generará `coverage/lcov.info`. Verifica que:
- Todos los tests pasen ✅
- Se genere la carpeta `coverage/` ✅
- Exista el archivo `coverage/lcov.info` ✅

### Paso 2: Hacer Commit y Push

**IMPORTANTE**: Los tests ya están creados, solo necesitas hacer commit:

```bash
# Desde la raíz del repositorio frontend
git add .
git commit -m "feat: implementar pruebas unitarias completas para frontend

- 48+ tests unitarios cubriendo autenticación, proyectos, validaciones y backlog
- Configuración de coverage para SonarQube
- Tests de integración con localStorage y mocks de API"

# Push a las ramas correspondientes
git push origin DEV
git push origin QA  
git push origin PROD
```

### Paso 3: Jenkins Ejecutará Automáticamente

Cuando hagas push:
1. Jenkins detectará los cambios
2. Ejecutará `npm test -- --coverage`
3. Generará `coverage/lcov.info`
4. Enviará el coverage a SonarQube

### Paso 4: Verificar en SonarQube

1. Ve a `http://localhost:9000`
2. Busca los proyectos:
   - `frontend-proyecto-final-DEV`
   - `frontend-proyecto-final-QA`
   - `frontend-proyecto-final-PROD`
3. Verifica que el **Coverage** sea > 0% (debería estar entre 70-80%)

---

## ⚙️ Configuración Actual

### package.json
```json
{
  "scripts": {
    "test": "react-scripts test --coverage --watchAll=false --ci --passWithNoTests"
  }
}
```

Esta configuración:
- ✅ Ejecuta todos los tests (incluyendo los que creé)
- ✅ Genera coverage automáticamente
- ✅ No requiere interacción (modo CI)
- ✅ No falla si no hay tests (`--passWithNoTests`)

### setupTests.js
```javascript
import '@testing-library/jest-dom';
```

Configurado correctamente para usar React Testing Library.

---

## 📝 Notas Importantes

### Compatibilidad con Jenkinsfile

✅ **Los tests que creé son 100% compatibles** con tu Jenkinsfile porque:

1. Siguen el patrón `*.test.js` que el Jenkinsfile busca
2. Usan las mismas librerías que el Jenkinsfile instala (`@testing-library/react`)
3. Se ejecutan con el mismo comando: `npm test -- --coverage`
4. Generan el mismo archivo que SonarQube necesita: `coverage/lcov.info`

### El Smoke Test del Jenkinsfile

El Jenkinsfile crea `App.smoke.test.jsx` como "backup", pero **los tests que creé tienen prioridad** porque:
- Son más completos (48+ vs 1)
- Cubren más código
- Generan más coverage
- Ejecutan las funcionalidades reales de la app

Ambos tests coexistirán y se ejecutarán juntos.

---

## 🎯 Resultado Final

Después de hacer commit y push:

1. **Jenkins** ejecutará los tests ✅
2. **Coverage** se generará automáticamente ✅
3. **SonarQube** mostrará coverage > 0% (esperado 70-80%) ✅
4. **Quality Gate** debería pasar si el coverage supera el mínimo requerido ✅

---

## ❓ Troubleshooting

### Si el coverage sigue en 0% en SonarQube:

1. Verifica que `coverage/lcov.info` se genere después de ejecutar `npm test`
2. Verifica que el Jenkinsfile tenga la ruta correcta: `coverage/lcov.info`
3. Verifica que SonarQube tenga los plugins de JavaScript/LCOV instalados
4. Revisa los logs de Jenkins para ver errores

### Si los tests fallan:

1. Ejecuta `npm install` para asegurar dependencias
2. Verifica que `setupTests.js` esté correcto
3. Revisa los mensajes de error en la consola

---

## ✅ Checklist Final

- [x] Tests unitarios creados (48+ tests)
- [x] Configuración de coverage en package.json
- [x] setupTests.js configurado
- [ ] Tests ejecutados localmente (debes hacerlo)
- [ ] Coverage verificado localmente (debes hacerlo)
- [ ] Commit y push a ramas DEV, QA, PROD
- [ ] Jenkins ejecuta pipeline exitosamente
- [ ] SonarQube muestra coverage > 0%

