import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Home from "./components/Home";
import RecipeWrite from "./components/RecipeWrite";
import RecipeBrowse from "./components/RecipeBrowse";
import RecipeDetail from "./components/RecipeDetail";
import MyPage from "./components/MyPage";
import LoginPage from "./components/LoginPage";
import Signup from "./components/Signup";
import AdminPage from "./components/AdminPage";
import MyInfo from "./components/MyInfo";
import TopChef from "./components/TopChef";
import PrivateRoute from "./components/PrivateRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "browse", Component: RecipeBrowse },
      { path: "write", element: <PrivateRoute><RecipeWrite /></PrivateRoute> },
      { path: "recipe/:recipeId", element: <PrivateRoute><RecipeDetail /></PrivateRoute> },
      { path: "mypage/:userId?", Component: MyPage },
      { path: "mypage/info", Component: MyInfo },
      { path: "login", Component: LoginPage },
      { path: "signup", Component: Signup },
      { path: "admin", Component: AdminPage },
      { path: "topchef", Component: TopChef },
    ],
  },
]);
