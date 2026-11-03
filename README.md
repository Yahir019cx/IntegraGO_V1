# IntegraGo

Aplicación móvil interna para AVIS, Budget y Payless. Esta fase incluye únicamente la base ejecutable del frontend y una pantalla provisional con el texto «IntegraGo».

El backend todavía no está definido. No hay integraciones, autenticación ni lógica de negocio.

## Stack

- Ionic Vue 9 y Vue 3.5 con Composition API y `script setup`.
- TypeScript 6 en modo estricto.
- Vite 8 y Vue Router 4 mediante `@ionic/vue-router`.
- Capacitor 8 para Android e iOS.
- ESLint 10 con reglas de Vue y TypeScript.
- npm y `package-lock.json` versionado para instalaciones reproducibles.

## Estructura

```text
IntegraGO_V1/
  IntegraGO_App/
    public/
    src/
    capacitor.config.ts
    ionic.config.json
    package.json
    package-lock.json
    ...
  .gitignore
  README.md
```

El repositorio raíz queda disponible para otros proyectos futuros. Todos los archivos y dependencias del frontend están en `IntegraGO_App`; no hay repositorios Git anidados.

## Requisitos

- Node.js 24 LTS y npm 11.
- Git.
- Para desarrollo nativo futuro: Android Studio y el SDK/JDK requerido por Capacitor para Android; macOS con Xcode para iOS. No son necesarios para ejecutar la versión web.

## Instalación y desarrollo

```sh
git clone https://github.com/Yahir019cx/IntegraGO_V1.git
cd IntegraGO_V1/IntegraGO_App
npm ci
npm run dev
```

Abrir la dirección que muestra Vite (normalmente `http://localhost:5173`). `npm start` también inicia el servidor de desarrollo.

## Validación y compilación

Ejecutar desde `IntegraGO_App`:

```sh
npm run typecheck
npm run lint
npm run build
npm run preview
```

`build` verifica TypeScript y genera `dist/`. `preview` sirve esa compilación localmente, normalmente en `http://localhost:4173`; no es un servidor para producción. El alias `@` apunta a `src` tanto en Vite como en TypeScript.

## Capacitor

La configuración común para Android e iOS está en `IntegraGO_App/capacitor.config.ts`: nombre visible `IntegraGo`, identificador **provisional** `com.integra.go` y directorio web `dist`.

Los paquetes de ambas plataformas están instalados, pero los proyectos nativos no se han generado. Confirmar y cambiar `appId` antes de generarlos y antes de publicar en las tiendas. Si ya se generaron, cambiar el archivo de configuración por sí solo no renombra los identificadores nativos.

Cuando comience la fase nativa, desde `IntegraGO_App`:

```sh
npm run build
npm run cap -- add android
# En macOS:
npm run cap -- add ios
# Después de los siguientes cambios web:
npm run cap -- sync
```

Los comandos nativos anteriores son instrucciones para una fase posterior. Las fuentes nativas generadas deberán versionarse entonces; los artefactos de compilación y las credenciales se excluyen mediante `.gitignore`.

Los archivos `.env` locales y las credenciales no se versionan. Si en el futuro se requieren variables de entorno, documentarlas mediante un `.env.example` sin secretos. Todo valor `VITE_*` es público en el bundle web.

## Validación de la base inicial

Verificado el 3 de noviembre de 2026 con Node.js 24.21.0 y npm 11.19.0:

- Instalación de dependencias, compilación, `vue-tsc --noEmit` y ESLint completados correctamente.
- El servidor de desarrollo Vite inició correctamente en `127.0.0.1:5173`. La comprobación visual en navegador quedó pendiente por denegación de acceso del navegador al origen local.
- Vite emite una advertencia por un bundle superior a 500 kB; no impide compilar. Revisar el tamaño al comenzar el desarrollo funcional.
- `npm audit --omit=dev`: cero vulnerabilidades. El audit completo reporta 16 avisos moderados, propagados desde `minimatch` y `glob` en las herramientas de desarrollo. Las soluciones automáticas propuestas requieren cambios mayores incompatibles; no se aplicó `npm audit fix --force`. Revisar actualizaciones compatibles antes de la fase nativa.
