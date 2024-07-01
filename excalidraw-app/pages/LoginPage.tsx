import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../../packages/excalidraw/services/api";
interface IBodyResponse {
  statusCode: number;
  body: {
    message: string;
    token?: string;
  };
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const [invalid, setInvalid] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await ApiService.axios.post<IBodyResponse>("/auth", {
        email,
        password,
      });
      if (response.data.statusCode === 200 && response.data.body.token) {
        const token = response.data.body.token;
        localStorage.setItem("x-user-token", token);
        navigate("/");
      } else if (response.data.statusCode === 401) {
        setInvalid((i) => [...i, "Usuario o contraseña incorrectos"]);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <form onSubmit={handleLogin}>
        {invalid.length > 0 && (
          <div style={{ color: "red" }}>
            {invalid.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="checkbox"
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="showPassword">Show Password</label>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};
