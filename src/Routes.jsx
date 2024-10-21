import App from "./App";
import Login from "./screens/Login";
import HomeUser from "./screens/HomeUser";
import HomeAdmin from "./screens/HomeAdmin";
import Exercises from "./screens/Exercises";
import Routines from "./screens/Routines";
import ProtectedRoute from "./ProtectedRoute";



// const routes = [
//     {
//         path: "/",
//         element: <App />,
//     },
//     {
//         path: "/login",
//         element: <Login />,
//     },
//     {
//         path: "/home",
//         element: <HomeUser />,
//     },
//     {
//         path: "/homeAdmin",
//         element: <HomeAdmin/>,
//         children: [
//             { path: "exercises", element: <Exercises /> },
//             { path: "routines", element: <Routines /> },
//           ],
//     },
   

// ];

const routes = [
    {
      path: "/",
      element: <App />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/home",
      element: <ProtectedRoute element={<HomeUser />} />, // Ruta protegida para usuarios autenticados
    },
    {
      path: "/homeAdmin",
      element: (
        <ProtectedRoute element={<HomeAdmin />} requiredRole="admin" /> // Ruta protegida solo para admins
      ),
    },
    {
      path: "/homeAdmin/exercises",
      element: (
        <ProtectedRoute element={<Exercises />} requiredRole="admin" /> // Ruta protegida solo para admins
      ),
    },
    {
      path: "/homeAdmin/routines",
      element: (
        <ProtectedRoute element={<Routines />} requiredRole="admin" /> // Ruta protegida solo para admins
      ),
    },
  ];

export default routes;