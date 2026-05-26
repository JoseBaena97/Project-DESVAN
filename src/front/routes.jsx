// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
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
import { Details } from "./pages/Details"

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Root Route: All navigation will start from here. */}
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

        {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
        <Route path="/" element={<Home />} />
        <Route path="/single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
        <Route path="/demo" element={<Demo />} />
        <Route path="/explorar" element={<Explore />} />
        <Route path="/crear-evento" element={<CreateEvent />} />
        <Route path="/detalles/:eventId" element={<Details />} />
      </Route>

      {/* Área de cuenta — navbar + sidebar, sin footer */}
      <Route element={<AccountLayout />}>
        <Route path="/perfil" element={<Profile />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/mis-reservas" element={<Reservations />} />
        <Route path="/mis-eventos" element={<MyEvents />} />
        <Route path="/mis-valoraciones" element={<Reviews />} />
      </Route>

      {/* Login / Registration Page separado sin navbar ni footer */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </>
  )
);