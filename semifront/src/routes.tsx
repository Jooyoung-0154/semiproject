import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Home from "./components/Home";
import RecipeWrite from "./components/RecipeWrite";
import RecipeBrowse from "./components/RecipeBrowse";
import RecipeDetail from "./components/RecipeDetail";
import MyPage from "./components/MyPage";
import ProfilePage from "./components/ProfilePage";
import LoginPage from "./components/LoginPage";
import Signup from "./components/Signup";
import AdminPage from "./components/AdminPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "browse", Component: RecipeBrowse },
      { path: "write", Component: RecipeWrite },
      { path: "recipe/:recipeId", Component: RecipeDetail },
      { path: "mypage/:userId?", Component: MyPage },
      { path: "login", Component: LoginPage },
      { path: "signup", Component: Signup },
      { path: "profile/:id", Component: ProfilePage },
      { path: "admin", Component: AdminPage },
    ],
  },
]);
