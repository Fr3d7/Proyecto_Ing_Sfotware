# Guía de Testing y Coverage

## 📋 Tests Unitarios Creados

Se han creado **48+ tests unitarios** para el frontend, organizados en los siguientes archivos:

### Archivos de Tests:
1. **`src/App.test.js`** - Tests de Autenticación (12 tests)
   - Login exitoso y con errores
   - Registro de usuarios
   - Logout y limpieza de localStorage
   - Manejo de errores de red

2. **`src/App.projects.test.js`** - Tests de Gestión de Proyectos (11 tests)
   - Listado de proyectos
   - Crear, editar y eliminar proyectos
   - Modal de nuevo proyecto
   - Ver detalles de proyecto

3. **`src/App.validation.test.js`** - Tests de Validación (13 tests)
   - Validación de formularios de login
   - Validación de formularios de registro
   - Validación de correos electrónicos
   - Validación de contraseñas y coincidencia

4. **`src/App.backlog.test.js`** - Tests de Backlog (12 tests)
   - Gestión de Epics
   - Gestión de User Stories
   - Asociación entre Epics y Stories
   - Eliminación en cascada

## 🚀 Pasos Siguientes

### 1. Ejecutar Tests Localmente

```bash
cd login-registration
npm test
```

O para generar coverage directamente:

```bash
npm run test
```

Esto ejecutará todos los tests y generará un reporte de coverage en la carpeta `coverage/`.

### 2. Verificar Coverage Generado

Después de ejecutar los tests, verifica que se haya generado:
- `coverage/lcov.info` - Archivo necesario para SonarQube
- `coverage/index.html` - Reporte visual del coverage

### 3. Verificar que Jenkinsfile Está Correcto

El Jenkinsfile ya está configurado para:
- Ejecutar tests con coverage: `npm test -- --coverage --watchAll=false --ci --passWithNoTests`
- Enviar coverage a SonarQube: `sonar.javascript.lcov.reportPaths=coverage/lcov.info`

### 4. Hacer Commit y Push

```bash
git add .
git commit -m "feat: agregar tests unitarios para frontend"
git push origin DEV  # o QA, PROD según corresponda
```

### 5. Verificar en Jenkins

1. Ve al dashboard de Jenkins: `http://localhost:8081`
2. Busca el job `ci-frontend-dev` (o QA, PROD)
3. Ejecuta un build manualmente o espera el trigger automático
4. Verifica que el stage "Run tests (coverage)" se ejecute correctamente
5. Verifica que el stage "SonarQube Analysis" funcione

### 6. Verificar en SonarQube

1. Ve al dashboard de SonarQube: `http://localhost:9000`
2. Busca el proyecto `frontend-proyecto-final-DEV` (o QA, PROD)
3. Verifica que el coverage aparezca (debería ser > 0% ahora)
4. Revisa las métricas de calidad

## 📊 Cobertura Esperada

Con los tests creados, deberías lograr:
- **Login/Registro**: ~80-90% de cobertura
- **Gestión de Proyectos**: ~70-80% de cobertura
- **Validaciones**: ~85-95% de cobertura
- **Backlog**: ~60-70% de cobertura

**Cobertura Total Estimada**: ~70-80%

## ⚠️ Troubleshooting

### Si los tests fallan:
1. Verifica que todas las dependencias estén instaladas: `npm install`
2. Verifica que `setupTests.js` esté correctamente configurado
3. Revisa los mensajes de error en la consola

### Si el coverage no se genera:
1. Verifica que el script de test en `package.json` incluya `--coverage`
2. Verifica que no haya errores en la ejecución de los tests
3. Verifica que exista la carpeta `coverage/` después de ejecutar tests

### Si SonarQube no muestra coverage:
1. Verifica que el archivo `coverage/lcov.info` se haya generado
2. Verifica la ruta en el Jenkinsfile: `-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info`
3. Verifica que SonarQube tenga el plugin de JavaScript/LCOV instalado

## 📝 Próximas Mejoras Recomendadas

1. **Tests de Sprints y Kanban**: Crear `App.sprints.test.js`
2. **Tests de Integración**: Tests E2E con Cypress o Playwright
3. **Mocks más robustos**: Simular diferentes escenarios de respuesta del servidor
4. **Tests de Rendimiento**: Verificar que los componentes rendericen rápidamente

## ✅ Checklist Final

- [ ] Tests ejecutan correctamente localmente
- [ ] Coverage se genera en `coverage/lcov.info`
- [ ] Cambios commiteados y pusheados a la rama correspondiente
- [ ] Jenkins ejecuta los tests correctamente
- [ ] SonarQube muestra el coverage actualizado
- [ ] Quality Gate pasa en SonarQube

