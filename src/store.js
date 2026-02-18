export const initialStore = () => {
  return {
    listaContactos: [],
    cargandoContactos: false,
    errorContactos: null,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "guardar_contactos":
      return {
        ...store,
        listaContactos: action.payload,
      };
    case "set_cargando_contactos":
      return {
        ...store,
        cargandoContactos: action.payload,
      };
    case "set_error_contactos":
      return {
        ...store,
        errorContactos: action.payload,
      };
    default:
      return store;
  }
}
