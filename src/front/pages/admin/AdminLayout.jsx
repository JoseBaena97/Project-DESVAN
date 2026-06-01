import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { PageTransition } from "../../components/PageTransition";
import "./admin.css";

export const AdminLayout = () => {
    return (
        <div className="admin-shell">
            <AdminSidebar />
            <div className="admin-content">
                <PageTransition>
                    <main className="admin-main">
                        <Outlet />
                    </main>
                </PageTransition>
            </div>
        </div>
    );
};
