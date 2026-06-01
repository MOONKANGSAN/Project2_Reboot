import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import "@/layouts/PublicLayout.css";

function PublicLayout(): JSX.Element {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;