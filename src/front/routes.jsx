// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { CreateEvent } from "./pages/CreateEvent";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { AccountLayout } from "./pages/account/AccountLayout";
import { Profile } from "./pages/account/Profile";
import { Favorites } from "./pages/account/Favorites";
import { Reservations } from "./pages/account/Reservations";
import { MyEvents } from "./pages/account/MyEvents";
import { Reviews } from "./pages/account/Reviews";
import { Details } from "./pages/Details";
import {PublicProfile} from "./pages/PublicProfile";
import { NotFound } from "./pages/NotFound";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminEvents } from "./pages/admin/AdminEvents";
import { AdminReviews } from "./pages/admin/AdminReviews";
import { AdminReports } from "./pages/admin/AdminReports";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Root Route: All navigation will start from here. */}
      <Route path="/" element={<Layout />} errorElement={<NotFound />} >

        {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
        <Route path="/" element={<Home />} />
        <Route path="/explorar" element={<Explore />} />
        
        {/* Rutas que comparten Layout y requieren autenticación */}
        <Route element={<ProtectedRoute />}>
          <Route path="/crear-evento" element={<CreateEvent />} />
          <Route path="/vendedor/:userId" element={<PublicProfile />} />
        </Route>
        
        <Route path="/detalles/:eventId" element={<Details />} />
      </Route>

      {/* Área de cuenta — navbar + sidebar, sin footer. Protegida. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AccountLayout />}>
          <Route path="/perfil" element={<Profile />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/mis-reservas" element={<Reservations />} />
          <Route path="/mis-eventos" element={<MyEvents />} />
          <Route path="/mis-valoraciones" element={<Reviews />} />
        </Route>
      </Route>

      {/* Panel de administración — protegido por AdminRoute */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/usuarios" element={<AdminUsers />} />
          <Route path="/admin/reportes" element={<AdminReports />} />
          <Route path="/admin/eventos" element={<AdminEvents />} />
          <Route path="/admin/valoraciones" element={<AdminReviews />} />
        </Route>
      </Route>

      {/* Login / Registration Page separado sin navbar ni footer */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Página 404 sin navbar ni footer */}
      <Route path="*" element={<NotFound />} />
    </>
  )
);