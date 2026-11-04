# IntegraGo

Aplicación móvil interna de captación comercial para AVIS, Budget y Payless. Frontend Ionic Vue con interfaz móvil y flujos de demostración. El backend todavía no está definido: no hay APIs, autenticación corporativa, envío de correo ni conexiones a sistemas de renta.

## Desarrollo

Requisitos: Node.js 24 LTS, npm 11 y Git. Desde la raíz:

```sh
cd IntegraGO_App
npm ci
npm run dev
```

Abrir la dirección indicada por Vite (normalmente http://localhost:5173). Para iniciar en el origen de pruebas:

```sh
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

```sh
npm run test       # Pruebas de lógica con Vitest
npm run typecheck # TypeScript estricto y SFC Vue
npm run lint      # ESLint, cero warnings permitidos
npm run build     # TypeScript + compilación a dist/
npm run preview   # Servir la compilación localmente
```

## Stack

Vue 3.5, Ionic Vue 9, Vue Router 4 mediante Ionic, TypeScript 6 estricto, Vite 8 y Capacitor 8. Composition API, script setup y CSS propio. Alias @ hacia src. Estado compartido mínimo con refs de Vue; no se necesita Pinia en esta fase.

Dependencias añadidas en la fase visual:

- @fontsource-variable/inter 5.3.0: fuente Inter local, sin llamadas a Google Fonts; se carga el subset latino.
- vitest 5.1.0: pruebas de validación, sesión, filtros y persistencia mock.

Las rutas se cargan de forma diferida. La compilación divide las dependencias en chunks conservando el orden de ejecución; no se ocultan advertencias mediante umbrales elevados.

## Estructura real

```text
IntegraGO_V1/
  .gitignore
  README.md
  IntegraGO_App/
    public/robots.txt
    src/
      assets/
        IntegraLogo.png
        BRANDS/{AVIS_L,BUDGET_L,Payless_L}.png
      components/
        AppField.vue, AppHeader.vue, AppIcon.vue, AppShell.vue
        AppSelect.vue
        AppDateTimePicker.vue
        BrandLogo.vue, BrandWaves.vue, FloatingTabBar.vue
        FolioListItem.vue, ListSkeleton.vue, OfferSummary.vue, StatusBadge.vue
      composables/
        useDraft.ts, useOfferList.ts
      services/
        catalogs.ts, offers.ts, session.ts
      utils/
        filterOffers.ts, format.ts, validation.ts
        dateTimePicker.ts
      views/
        SplashPage.vue, LoginPage.vue, HomePage.vue, CapturePage.vue
        OfferSuccessPage.vue, FoliosPage.vue, FolioDetailPage.vue
        AccountPage.vue, ScanPage.vue, NotFoundPage.vue
        capture/ClientStep.vue, capture/OfferStep.vue
      App.vue, main.ts, router.ts, styles.css, types.ts
    tests/mock-flow.test.ts
    tests/date-time-picker.test.ts
    capacitor.config.ts
    eslint.config.js
    ionic.config.json
    index.html
    package.json
    package-lock.json
    tsconfig.json
    vite.config.ts
```

El repositorio raíz queda disponible para otros proyectos; no hay repositorios anidados.

## Acceso de demostración

En Iniciar sesión, pulsar el botón sin llenar los campos. El acceso mock no exige ni valida credenciales. **No usar credenciales reales.** Los campos se conservan como referencia visual y se limpian al entrar; sus valores no se envían ni se persisten.

La identidad ficticia fija se configura en `src/services/session.ts` mediante DEMO_USER: Alex Demo, vendedor de Budget en MID. No se selecciona marca ni aeropuerto en la interfaz. Se guarda únicamente el marcador `demo` en sessionStorage con la clave `integrago.demo-session.v1`, para restaurar la sesión al recargar la misma pestaña. Si ese almacenamiento está bloqueado, la sesión sigue en memoria. Esto no autentica ni protege datos de producción.

Las rutas privadas redirigen al login sin sesión. Cerrar sesión elimina el marcador y limpia el borrador de captación; los folios mock permanecen en el navegador.

Cambiar el rol tipado de DEMO_USER a `counter` permite revisar la configuración de navegación de mostrador: Escanear sustituye a Captar. El escáner es una pantalla explícitamente pendiente, sin acceso a cámara.

## Flujos y datos mock

- `/`: presentación con el recurso original de IntegraGo. Redirige inmediatamente según la sesión; sin temporizadores artificiales.
- `/login`: formulario, mostrar/ocultar contraseña y recuperación indicada como pendiente.
- `/home`: marca de la sesión, saludo, empleado, dos indicadores y actividad reciente.
- `/capture`: cliente, oferta y resumen. Nombre, correo, teléfono, fechas futuras/ordenadas y total positivo de hasta dos decimales son obligatorios. Permite volver sin perder el borrador en memoria.
- `/offers/:reference/success`: confirmación para el vendedor con folio de seguimiento independiente, copiar esa referencia y Finalizar. No genera QR, no muestra el folio interno ni permite compartirlo.
- `/folios`: búsqueda por folio/nombre/teléfono y filtros por los cinco estados, además de Todos y Activos. Activos agrupa Generado y Presentado.
- `/folios/:reference`: detalle de una oferta del usuario, marca y aeropuerto de la sesión; contempla folio inexistente.
- `/account`: perfil de solo lectura, soporte y edición pendientes, información y cierre de sesión.
- `/scan`: reserva para el rol mostrador; escaneo pendiente.
- Direcciones desconocidas: pantalla de página no encontrada.

Los catálogos de grupos y coberturas varían por marca. El precio total se captura manualmente: no hay cálculo tarifario ni descuentos. El servicio incluye cinco ofertas iniciales ficticias y genera identificadores de prueba únicos frente a los registros guardados. El folio visible del vendedor usa una referencia SEG-DEMO independiente. Inicio, Folios, búsquedas, detalle, rutas y portapapeles utilizan esa referencia. Las ofertas locales existentes reciben una referencia de seguimiento persistente sin borrar datos. Se retiraron qrcode y sus tipos al dejar de utilizarse.

Los registros se guardan en localStorage, clave `integrago.demo-offers.v1`, exclusivamente para desarrollo y con datos ficticios. No es almacenamiento seguro ni de producción. Los datos corruptos o el fallo de escritura se notifican sin fingir un guardado exitoso. Para reiniciar los datos de prueba, eliminar esa clave desde las herramientas del navegador y volver a cargar. El borrador permanece únicamente en memoria y se limpia tras generar una oferta o cerrar sesión; recargar durante la captura descarta el borrador.

## Diseño y branding

Variables de color, tipografía, espaciado y estilos en `src/styles.css`. Fondo blanco, azul institucional, superficies planas y material translúcido solo en la navegación flotante. Safe areas, separación inferior del contenido, controles táctiles y reducción de movimiento/transparencia consideradas. La navegación se oculta cuando visualViewport detecta teclado con un campo enfocado; los formularios y la confirmación no muestran bottom bar.

Los selectores nativos están prohibidos en la interfaz. Grupo de vehículo, cobertura y moneda utilizan AppSelect: una hoja personalizada de Ionic con búsqueda instantánea que ignora acentos y mayúsculas, opciones táctiles, estado seleccionado y navegación con flechas, Enter y Escape. No se añadió otra biblioteca visual. La revisión visual de este control queda a cargo del usuario; TypeScript y ESLint pasan sin ejecutar nuevos builds.

Entrega y devolución usan AppDateTimePicker en una hoja móvil: calendario Ionic estilizado, pestañas Fecha/Hora, hora por ruedas, vista previa y confirmación explícita. Cancelar no cambia el formulario. Se conservan fecha y hora locales sin conversión a UTC durante la captura y se impiden fechas pasadas o devolución anterior a la entrega. No hay inputs date/time/datetime-local ni selects nativos. Los buscadores usan botones propios para limpiar su contenido. La revisión visual y de interacción queda a cargo del usuario; no se ejecutan builds por esta corrección.

Se utilizan los archivos de marca proporcionados sin reconstruirlos ni alterar sus colores o proporciones. `IntegraLogo.png` incluye solamente el símbolo circular: falta el archivo original de la composición completa con el texto IntegraGo que aparece en el mockup. No se recreó ese texto como logotipo. Los tres archivos de marca están disponibles; tras iniciar sesión solo se muestra el correspondiente a la sesión.

## Capacitor

Capacitor usa el nombre IntegraGo, el identificador `mx.grupocge.integrago` y el directorio web `dist`. Usa ese identificador al registrar el App ID explícito de iOS para App Store Connect. Los proyectos nativos se generarán cuando se prepare cada plataforma.

En una fase posterior, con Android Studio/SDK/JDK compatibles o macOS con Xcode para iOS:

```sh
npm run build
npm run cap -- add android
# Solo en macOS:
npm run cap -- add ios
# Después de futuros cambios web:
npm run cap -- sync
```

Los fuentes nativos deberán versionarse entonces. Artefactos, caches, dependencias, archivos .env locales y credenciales quedan excluidos mediante .gitignore. Los valores VITE_* serían públicos en el bundle.

## Validación de la fase visual

- Compilación de producción completada sin advertencias de tamaño; TypeScript y ESLint pasan.
- 18 pruebas de lógica pasan: sesión, almacenamiento, folios únicos, catálogos, validaciones, filtros, fechas, conversión de hora, migración y exclusión del identificador interno en los datos de las vistas.
- Vite arranca en 127.0.0.1:5173.
- Audit de producción: cero vulnerabilidades. El audit completo aún reporta avisos moderados en herramientas de desarrollo; no se aplicaron cambios incompatibles con audit fix --force.
- La revisión visual y la prueba interactiva de rutas quedan a cargo del usuario, según su indicación. El navegador de Codex bloqueó el origen local; no se presenta la revisión en diferentes viewports ni el flujo UI completo como verificados. Las pruebas de lógica no sustituyen esa revisión.
- Por indicación del usuario no se lanzan más builds ni se deja el servidor de pruebas ejecutando en segundo plano. El último build pasó antes de los ajustes finales de enfoque, saludo y captura decimal; TypeScript y ESLint se verificaron también después de esos ajustes.
- No se probó en dispositivos físicos ni proyectos nativos Android/iOS; teclado nativo, safe areas y compartir requieren esa QA al comenzar la fase nativa.

## Separación de folios y confidencialidad

El vendedor recibe únicamente su folio de seguimiento, sin folio real ni QR. La relación entre el folio de seguimiento, el identificador real y el QR deberá residir exclusivamente en la BD del backend; la API del vendedor no deberá devolver esos datos internos. El backend resolverá el match internamente con autorización por rol. El folio de seguimiento no será una credencial de canje ni un sustituto del QR.

El mock local simula esa relación y expone a las vistas una proyección tipada sin identificador interno. Esto no garantiza confidencialidad real: todo dato persistido en localStorage puede inspeccionarse en el dispositivo. En producción la relación y los secretos deben permanecer en servidor. No se ha implementado BD, API ni un mecanismo de canje en esta fase.
