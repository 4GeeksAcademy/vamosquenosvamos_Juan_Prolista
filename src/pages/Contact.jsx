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
    <div className="container">
      <section className="hero-contactos rounded-4 p-4 p-md-5 mb-4 mb-md-5">
        <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
          <div>
            <p className="text-uppercase small fw-semibold mb-2">Agenda digital</p>
            <h1 className="display-6 fw-bold mb-2">Lista de contactos</h1>
            <p className="mb-0 text-secondary">
              Gestiona tu agenda de forma simple, clara y rápida.
            </p>
          </div>
          <Link to="/contacto/nuevo" className="btn btn-primary btn-lg align-self-start">
            <i className="fa-solid fa-user-plus me-2" />
            Agregar contacto
          </Link>
        </div>
      </section>

      <div className="mb-3">
        <h2 className="h4 mb-0">Tus contactos</h2>
      </div>

      {store.cargandoContactos && (
        <p className="text-muted">Cargando contactos...</p>
      )}

      {store.errorContactos && <p className="text-danger">{store.errorContactos}</p>}

      {!store.cargandoContactos && store.listaContactos.length === 0 && (
        <div className="alert alert-light border rounded-4">
          No hay contactos todavía.
        </div>
      )}

      <div className="row g-3 g-md-4">
        {store.listaContactos.map((contactoItem) => (
          <div className="col-12 col-lg-6" key={contactoItem.id}>
            <ContactCard contacto={contactoItem} />
          </div>
        ))}
      </div>
    </div>
  );
};
