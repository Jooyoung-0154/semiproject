import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"}/api`,
  withCredentials: true,
});

/*
 * FormData 업로드 시 Content-Type을 직접 지정하면 boundary가 빠져서
 * Spring Boot에서 415 Unsupported Media Type이 발생할 수 있음.
 * JSON 요청은 axios가 자동으로 application/json 처리하고,
 * FormData 요청은 브라우저가 multipart/form-data; boundary=... 를 자동 생성하게 둠.
 */
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete (config.headers as any)["Content-Type"];
      delete (config.headers as any)["content-type"];
    }
  }
  return config;
});

export default api;
