import axios from "axios";
import type { AxiosInstance } from "axios";

class Service {
  axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: "https://draw-api.sebastiantuyu.com",
      headers: {
        "x-auth-api": localStorage.getItem("x-user-token"),
      },
    });

    this.axios.interceptors.response.use(
      (r) => r,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Redirect to login page if 401 is received
          localStorage.removeItem("x-user-token");
          window.location.href = "/";
        }
        return { data: { error }, status: 401 };
      },
    );
  }
}

export const ApiService = new Service();
