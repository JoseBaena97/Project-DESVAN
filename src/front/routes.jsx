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

export const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Root Route: All navigation will start from here. */}
        <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

          {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
          <Route path= "/" element={<Home />} />
          <Route path="/single/:theId" element={ <Single />} />  {/* Dynamic route for single items */}
          <Route path="/demo" element={<Demo />} />
          <Route path="/explorar" element={<Explore />} />
          <Route path="/crear-evento" element={<CreateEvent />} />
        </Route>

        {/* Login / Registration Page separado sin navbar ni footer */}
        <Route path="/login" element={<Login />} />
      </>
    )
);