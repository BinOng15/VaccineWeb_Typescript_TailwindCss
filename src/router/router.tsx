import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import AppRouter from "./AppRouter";
import Homepage from "../pages/Customer/Homepage";
import { ROLES } from "../constants";
import { AuthWrapper } from "../context/auth.context";
import Introductionpage from "../pages/Customer/Introductionpage";
import MainForm from "../pages/Customer/VaccineRegistForm";
import PaymentMethod from "../pages/Customer/Payment";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: (
          <AppRouter element={Homepage} allowedRoles={[ROLES.CUSTOMER]} />
        ),
      },
      {
        path: "/Introduction",
        element: (
          <AppRouter element={Introductionpage} allowedRoles={[ROLES.CUSTOMER]} />
        ),
      },
      {
        path: "/Registration",
        element: (
          <AppRouter element={MainForm} allowedRoles={[ROLES.CUSTOMER]} />
        ),
      },
      {
        path: "/Payment",
        element: (
          <AppRouter element={PaymentMethod} allowedRoles={[ROLES.CUSTOMER]} />
        ),
      }
    ],
  },
]);

const RouterComponent: React.FC = () => {
  return (
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  );
};

export default RouterComponent;
