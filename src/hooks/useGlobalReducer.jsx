import { useContext, useMemo, useReducer, createContext } from "react";
import storeReducer, { initialStore } from "../store";

const StoreContext = createContext();
const URL_BASE_API = "https://playground.4geeks.com/contact";
export const AGENDA_SLUG =
  import.meta.env.VITE_AGENDA_SLUG || "vamosquenosvamos_juan_prolista";

export function StoreProvider({ children }) {
  const [store, dispatch] = useReducer(storeReducer, initialStore());

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

    const intentarRequest = async (opcionesRequest = []) => {
      let ultimoError = null;

      for (const opcion of opcionesRequest) {
        try {
          const respuesta = await fetch(opcion.url, opcion.configuracion || {});
          if (respuesta.ok) return respuesta;

          ultimoError = new Error(
            `Error HTTP ${respuesta.status} en ${opcion.url}`
          );
        } catch (error) {
          ultimoError = error;
        }
      }

      throw ultimoError || new Error("No se pudo completar la solicitud");
    };

    const obtenerContactos = async () => {
      dispatch({ type: "set_cargando_contactos", payload: true });
      try {
        await asegurarAgenda();
        const respuesta = await intentarRequest([
          {
            url: `${URL_BASE_API}/agendas/${AGENDA_SLUG}/contacts`,
          },
          {
            url: `${URL_BASE_API}/agendas/${AGENDA_SLUG}`,
          },
        ]);

        const datos = await respuesta.json();
        const contactosApi = Array.isArray(datos)
          ? datos
          : datos.contacts || datos.contactos || [];

        dispatch({ type: "guardar_contactos", payload: contactosApi });
        dispatch({ type: "set_error_contactos", payload: null });
        return contactosApi;
      } catch (error) {
        console.error("Error al obtener contactos:", error);
        dispatch({
          type: "set_error_contactos",
          payload: "Error al cargar contactos",
        });
        return [];
      } finally {
        dispatch({ type: "set_cargando_contactos", payload: false });
      }
    };

    const crearContacto = async (datosContacto) => {
      try {
        await asegurarAgenda();
        const payloadBase = {
          full_name: datosContacto.full_name,
          email: datosContacto.email,
          phone: datosContacto.phone,
          address: datosContacto.address,
        };

        await intentarRequest([
          {
            url: `${URL_BASE_API}/agendas/${AGENDA_SLUG}/contacts`,
            configuracion: {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...payloadBase,
                agenda_slug: AGENDA_SLUG,
              }),
            },
          },
          {
            url: `${URL_BASE_API}/agendas/${AGENDA_SLUG}/contacts`,
            configuracion: {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payloadBase),
            },
          },
          {
            url: `${URL_BASE_API}/agendas/${AGENDA_SLUG}/contacts`,
            configuracion: {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...payloadBase,
                name: payloadBase.full_name,
              }),
            },
          },
          {
            url: `${URL_BASE_API}/contacts`,
            configuracion: {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...payloadBase,
                agenda_slug: AGENDA_SLUG,
              }),
            },
          },
        ]);

        await obtenerContactos();
        return true;
      } catch (error) {
        console.error("Error al crear contacto:", error);
        return false;
      }
    };

    const actualizarContacto = async (idContacto, datosContacto) => {
      try {
        const payloadBase = {
          full_name: datosContacto.full_name,
          email: datosContacto.email,
          phone: datosContacto.phone,
          address: datosContacto.address,
        };

        await intentarRequest([
          {
            url: `${URL_BASE_API}/contacts/${idContacto}`,
            configuracion: {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...payloadBase,
                agenda_slug: AGENDA_SLUG,
              }),
            },
          },
          {
            url: `${URL_BASE_API}/agendas/${AGENDA_SLUG}/contacts/${idContacto}`,
            configuracion: {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payloadBase),
            },
          },
          {
            url: `${URL_BASE_API}/agendas/${AGENDA_SLUG}/contacts/${idContacto}`,
            configuracion: {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...payloadBase,
                name: payloadBase.full_name,
              }),
            },
          },
        ]);

        await obtenerContactos();
        return true;
      } catch (error) {
        console.error("Error al actualizar contacto:", error);
        return false;
      }
    };

    const borrarContacto = async (idContacto) => {
      try {
        await intentarRequest([
          {
            url: `${URL_BASE_API}/contacts/${idContacto}`,
            configuracion: {
              method: "DELETE",
            },
          },
          {
            url: `${URL_BASE_API}/agendas/${AGENDA_SLUG}/contacts/${idContacto}`,
            configuracion: {
              method: "DELETE",
            },
          },
        ]);

        await obtenerContactos();
        return true;
      } catch (error) {
        console.error("Error al borrar contacto:", error);
        return false;
      }
    };

    return {
      obtenerContactos,
      crearContacto,
      actualizarContacto,
      borrarContacto,
    };
  }, [dispatch]);

  return (
    <StoreContext.Provider value={{ store, dispatch, acciones }}>
      {children}
    </StoreContext.Provider>
  );
}

export default function useGlobalReducer() {
  return useContext(StoreContext);
}
