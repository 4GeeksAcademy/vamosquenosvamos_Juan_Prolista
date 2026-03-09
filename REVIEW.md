# 📝 Revisión del proyecto: Contact List App Using React & Context

## ✅ Aspectos Positivos

1. **CRUD real contra la API oficial**: El proyecto ya estaba conectado al playground de contactos y resolvía lectura, creación, edición y borrado de contactos persistidos.

2. **Buena base visual**: La UI es clara, las tarjetas son entendibles y la maquetación con Bootstrap hace que la app siga siendo usable en desktop y mobile.

3. **Componente reutilizable para cada contacto**: Tener `ContactCard` separado evita meter toda la UI en una sola vista y va en la dirección correcta de modularidad.

4. **Formulario controlado**: Los inputs ya estaban conectados a estado React, lo que facilita validar, editar y mantener el formulario.

## 🔍 Áreas de Mejora

### 1. Mover la lógica de negocio al `store.js`

La rúbrica de este proyecto pide explícitamente que el estado global y las acciones vivan en `src/store.js`, dejando `src/hooks/useGlobalReducer.jsx` únicamente como wrapper limpio del provider/hook. En la versión original, el hook contenía `fetch`, reintentos, normalización y operaciones CRUD completas.

**Código original:**
```jsx
const acciones = useMemo(() => {
  const asegurarAgenda = async () => {
    try {
      await fetch(`${URL_BASE_API}/agendas/${AGENDA_SLUG}`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error al intentar crear agenda:", error);
    }
  };

  const obtenerContactos = async () => {
    dispatch({ type: "set_cargando_contactos", payload: true });
    // ...
  };

  const crearContacto = async (datosContacto) => {
    // ...
  };
```

**Código mejorado:**
```jsx
export async function loadContacts(dispatch) {
  dispatch({ type: ACTION_TYPES.setLoadingContacts, payload: true });
  dispatch(clearErrorAction());

  try {
    await ensureAgendaExists();
    const contacts = await fetchContactsFromApi();
    dispatch({ type: ACTION_TYPES.setContacts, payload: contacts });
    return contacts;
  } catch (error) {
    dispatch({
      type: ACTION_TYPES.setError,
      payload: error.message || "No se pudieron cargar los contactos.",
    });
    return [];
  } finally {
    dispatch({ type: ACTION_TYPES.setLoadingContacts, payload: false });
  }
}
```

**¿Por qué es mejor?**
- El hook queda simple y fácil de mantener.
- La capa global concentra la lógica de negocio donde la solución la espera.
- Reusar acciones como `loadContacts`, `addContact` y `updateContact` es mucho más directo.

### 2. Alinear rutas y vistas con la solución de referencia

La versión original resolvía la navegación, pero no seguía la estructura pedida por la rúbrica: dos vistas claras (`ContactList` y `ContactForm`) y rutas estándar `/add` y `/edit/:id`.

**Código original:**
```jsx
<Route path="/" element={<Contact />} />
<Route path="/contacto/nuevo" element={<AddContact />} />
<Route path="/contacto/:id" element={<AddContact />} />
```

**Código mejorado:**
```jsx
<Route index element={<ContactList />} />
<Route path="/add" element={<ContactForm />} />
<Route path="/edit/:id" element={<ContactForm />} />
<Route path="/contacto/nuevo" element={<ContactForm />} />
<Route path="/contacto/:id" element={<ContactForm />} />
```

**¿Por qué es mejor?**
- Cumple exactamente la convención de la solución.
- Hace más claro qué vista lista y cuál edita/crea.
- Mantiene compatibilidad con rutas anteriores sin sacrificar la estructura correcta.

### 3. Subir el nivel de validación y feedback del formulario

El formulario original dependía casi por completo de `required` y de un mensaje genérico al fallar el guardado. Eso funciona, pero se queda corto frente a la rúbrica, que pide validación mínima y feedback visible.

**Código original:**
```jsx
const alEnviarFormulario = async (evento) => {
  evento.preventDefault();
  setCargandoFormulario(true);
  setErrorFormulario("");

  let guardadoOk = false;
  if (esModoEditar) {
    guardadoOk = await acciones.actualizarContacto(id, datosFormulario);
  } else {
    guardadoOk = await acciones.crearContacto(datosFormulario);
  }
```

**Código mejorado:**
```jsx
const validationErrors = validateContactData(formData);
setFieldErrors(validationErrors);

if (Object.keys(validationErrors).length > 0) {
  return;
}

if (isEditMode) {
  const wasUpdated = await updateContact(dispatch, id, formData);
  if (wasUpdated) navigate("/");
  return;
}
```

**¿Por qué es mejor?**
- El usuario recibe feedback antes de disparar la petición.
- La validación se puede reutilizar en más de una vista o proyecto.
- El flujo de guardado queda más predecible y fácil de depurar.

### 4. Eliminar boilerplate muerto y dejar el proyecto verificable

Había archivos de plantilla que ya no aportaban al proyecto (`Home`, `Single`, `Demo`) y la configuración de ESLint estaba en `eslint.cjs`, por lo que `npm run lint` no encontraba la configuración esperada.

**Mejora aplicada**
- Se eliminaron vistas de template sin uso real.
- Se dejó la estructura final en torno a `ContactList`, `ContactForm` y `ContactCard`.
- Se renombró la configuración a `.eslintrc.cjs` para que el lint funcione sin hacks.

**¿Por qué es mejor?**
- Menos ruido para quien mantenga el proyecto.
- La revisión queda apoyada por herramientas reales (`lint` y `build`).
- El repositorio refleja mejor el alcance del ejercicio.

## 🎯 Patrones y Anti-patrones Identificados

### Patrones Positivos Encontrados ✅

#### 1. Componente reutilizable de presentación

**Tipo:** Patrón ✅

**Dónde aparece:**
- `src/components/ContactCard.jsx`

**Descripción:** La tarjeta del contacto ya estaba separada de la vista principal, lo que evita duplicación visual y facilita reutilizar la representación de cada contacto.

**¿Por qué es importante?**
- Mejora la modularidad.
- Hace la lista más legible.
- Permite evolucionar el diseño de cada contacto sin tocar la vista completa.

#### 2. Inputs controlados con React

**Tipo:** Patrón ✅

**Dónde aparece:**
- `src/pages/AddContact.jsx`

**Descripción:** El formulario ya estaba conectado a estado React usando `value` y `onChange`, que es el patrón correcto para validar y editar datos en formularios.

### Anti-patrones a Mejorar ❌

#### 1. Hook/provider demasiado cargado

**Tipo:** Anti-patrón ❌

**Dónde aparece:**
- `src/hooks/useGlobalReducer.jsx`

**Descripción:** El hook mezclaba infraestructura de Context con reglas de negocio, peticiones remotas, normalización y sincronización de la agenda.

**Alternativa:**
```jsx
export function StoreProvider({ children }) {
  const [store, dispatch] = useReducer(storeReducer, initialStore());

  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}
```

**Conceptos relacionados:**
- Separación de responsabilidades
- Single responsibility principle
- Arquitectura predecible en React

#### 2. Boilerplate muerto del template

**Tipo:** Anti-patrón ❌

**Dónde aparece:**
- `src/pages/Home.jsx`
- `src/pages/Single.jsx`
- `src/pages/Demo.jsx`

**Descripción:** Mantener archivos heredados del template dificulta entender cuál es la estructura real del proyecto y penaliza la limpieza del repositorio.

## 📊 Evaluación Detallada

### Criterios de Evaluación (Total: 83/100)

| Criterio | Puntos | Obtenido | Comentario |
|----------|--------|----------|------------|
| **Funcionalidad Básica** | 30 | 29 | CRUD conectado a la API y sincronizado, aunque el flujo global todavía necesitaba una capa más robusta de estado/error |
| **Código Limpio** | 20 | 15 | Código legible y con buena base visual, pero con boilerplate muerto y algunas decisiones que dispersaban responsabilidad |
| **Estructura** | 15 | 9 | La app funcionaba, pero la lógica async estaba en `useGlobalReducer.jsx` y la estructura no seguía la solución de referencia |
| **Buenas Prácticas** | 15 | 10 | Formularios controlados y router funcionales, pero con validación y feedback todavía limitados |
| **HTML/CSS** | 10 | 10 | Interfaz clara, consistente y usable en responsive |
| **UX/Animaciones** | 10 | 10 | Navegación entendible, confirmación de borrado y base visual suficientemente cuidada |
| **TOTAL** | **100** | **83** | **⚠️ Necesita mejora** |

### Desglose de Puntos Perdidos (-17 puntos)

1. **-6 puntos** - La lógica de negocio, `fetch` y acciones async vivían en `src/hooks/useGlobalReducer.jsx` en lugar de concentrarse en `src/store.js`, que es un requisito explícito de la rúbrica.
2. **-5 puntos** - El repositorio mantenía boilerplate del template y archivos muertos que ya no aportaban al flujo real del proyecto.
3. **-3 puntos** - La estructura de rutas y vistas no seguía la convención esperada (`/add`, `/edit/:id`, `ContactList`, `ContactForm`), lo que restaba claridad arquitectónica.
4. **-3 puntos** - La validación del formulario era mínima y el feedback al usuario seguía siendo demasiado genérico para los casos de error y edición.

### Cómo Llegar a 100/100

Aplicando las correcciones de este PR:
- ✅ **+6 puntos** - Se movió toda la lógica global a `src/store.js`, dejando `src/hooks/useGlobalReducer.jsx` limpio como provider/hook.
- ✅ **+5 puntos** - Se eliminó el boilerplate muerto y se dejó una estructura final coherente con el ejercicio.
- ✅ **+3 puntos** - Se alinearon las rutas y las vistas con la solución de referencia sin romper compatibilidad.
- ✅ **+3 puntos** - Se añadió validación reutilizable, carga/error más claros y mejor feedback en formulario y listado.

**= 100/100** 🎉

## 🧪 Verificación

- `npm run lint` ✅
- `npm run build` ✅

## 📊 Resumen

| Aspecto | Estado |
|---------|--------|
| CRUD con API | ✅ Correcto |
| Arquitectura global | ⚠️ Mejorable en versión original |
| Separación de vistas | ⚠️ Mejorable en versión original |
| Validación y feedback | ⚠️ Mejorable en versión original |
| UI y maquetación | ✅ Sólidas |

**Nota final**: El proyecto ya tenía una base funcional clara y una UI agradable. Las correcciones de este PR no rehacen el trabajo desde cero; ordenan la arquitectura, alinean la entrega con la rúbrica y dejan un patrón mucho más reutilizable para futuros proyectos con Context y APIs. 🎉
