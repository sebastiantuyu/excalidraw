import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import ExcalidrawApp from "../App";
import { LoginPage } from "../pages/LoginPage";

const BASE_ROUTE = "/app";

const isAuthenticated = () => {
  return localStorage.getItem("x-user-token");
};

const ProtectedRoute = ({
  redirectPath = `${BASE_ROUTE}/inicia-sesion`,
}: {
  user?: any;
  redirectPath?: string;
}) => {
  if (!isAuthenticated()) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

const RedirectOnAuth = () => {
  const redirectPath = `${BASE_ROUTE}`;
  if (isAuthenticated()) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute user={undefined} />}>
          <Route path="*" element={<ExcalidrawApp />} />
        </Route>
        <Route element={<RedirectOnAuth />}>
          <Route
            path={`/${BASE_ROUTE}/inicia-sesion`}
            element={<LoginPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
