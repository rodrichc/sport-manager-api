---
name: git-commit
description: Reglas y convenciones para crear commits en Git. Se activa cuando hay que commitear cambios o manejar el historial.
---

# Reglas de Git Commit

Cuando debas realizar commits en el repositorio, aplicá estrictamente las siguientes reglas basándote en el historial existente:

## Formato del Mensaje
Utilizá **Conventional Commits** con el siguiente formato:
`<tipo>(<alcance opcional>): <descripción corta>`

- **feat**: Una nueva característica o funcionalidad. Ej: `feat(security): implement users module`
- **fix**: Corrección de un bug.
- **refactor**: Cambio estructural que no añade funcionalidad nueva ni arregla un bug (ej. limpieza de deuda técnica, patrones de diseño). Ej: `refactor(core): implement global prisma soft deletes`
- **test**: Añadir, modificar o estabilizar pruebas (unitarias o de integración).
- **docs**: Cambios exclusivos en la documentación (Swagger, README, etc.). Ej: `docs(auth): add swagger documentation for login`
- **chore**: Mantenimiento, dependencias o tareas rutinarias.

## Reglas Clave
1. **Atómicos y Lógicos**: Agrupá los archivos por contexto. No mezcles un refactor de configuración con una feature nueva en el mismo commit. Hacé múltiples commits si es necesario.
2. **Minúsculas**: El mensaje principal (tipo, alcance y título) debe estar enteramente en minúsculas.
3. **Modo Imperativo**: Redactá en tiempo imperativo (ej. "add pagination", no "added pagination" ni "adds pagination").
4. **Cuerpo Extendido**: Si el commit abarca muchos archivos o decisiones complejas, utilizá múltiples flags `-m` en el comando de git para añadir una descripción detallada que explique el *por qué* y *qué* se cambió.
