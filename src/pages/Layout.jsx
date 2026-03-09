import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const Layout = () => {
  return (
    <ScrollToTop>
      <Navbar />
      <main className="app-shell py-4 py-md-5">
        <Outlet />
      </main>
      <Footer />
    </ScrollToTop>
  );
};
