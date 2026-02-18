import { Link } from "react-router-dom";

export const Navbar = () => {
	return (
		<nav className="navbar navbar-expand-lg app-navbar sticky-top shadow-sm">
			<div className="container py-1">
				<Link className="navbar-brand fw-semibold d-flex align-items-center gap-2" to="/">
					<span className="brand-badge">
						<i className="fa-solid fa-address-book" />
					</span>
					<span>Mis Contactos</span>
				</Link>
				<div className="ms-auto">
					<Link to="/contacto/nuevo" className="btn btn-primary px-3">
						<i className="fa-solid fa-user-plus me-2" />
						Nuevo contacto
					</Link>
				</div>
			</div>
		</nav>
	);
};
