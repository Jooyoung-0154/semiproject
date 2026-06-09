import api from "../api/axios";
import { Member } from "../types/type.ts";

export interface LoginParams {
  id: string;
  password: string;
}

export const authService = {
  login: (params: LoginParams) => api.post<Member>("/member/login", params),
  logout: () => api.post("/member/logout"),
};
