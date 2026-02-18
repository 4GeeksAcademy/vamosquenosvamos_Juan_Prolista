import { useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { ContactCard } from "../components/ContactCard";

export const Contact = () => {
  const { store, acciones } = useGlobalReducer();

  useEffect(() => {
    if (store.listaContactos.length === 0) {
      acciones.obtenerContactos();
    }
  }, [acciones, store.listaContactos.length]);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Lista de contactos</h1>
        <Link to="/contacto/nuevo" className="btn btn-success">
          Agregar contacto
        </Link>
      </div>

      {store.cargandoContactos && (
        <p className="text-muted">Cargando contactos...</p>
      )}

      {store.errorContactos && <p className="text-danger">{store.errorContactos}</p>}

      {!store.cargandoContactos && store.listaContactos.length === 0 && (
        <div className="alert alert-light border">No hay contactos todavía.</div>
      )}

      <div className="d-flex flex-column gap-3">
        {store.listaContactos.map((contactoItem) => (
          <ContactCard key={contactoItem.id} contacto={contactoItem} />
        ))}
      </div>
    </div>
  );
};
