import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import AppRouter from "./AppRouter";
import Homepage from "../pages/Customer/Homepage";
import { ROLES } from "../constants";
import { AuthWrapper } from "../context/auth.context";

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
