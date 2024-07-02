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
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setInvalid([]);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "Assistant, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: 15,
        fontSize: "0.96em",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "350px",
          display: "flex",
          flexDirection: "column",
          gap: 15,
          alignItems: "center",
        }}
      >
        <h2>Login to Excalidraw</h2>
        {invalid.length > 0 && (
          <div style={{ color: "red" }}>
            {invalid.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
        <div
          style={{ display: "flex", flexDirection: "column", width: "inherit" }}
        >
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ fontFamily: "Assistant, sans-serif" }}
          />
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", width: "inherit" }}
        >
          <label htmlFor="password">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ fontFamily: "Assistant, sans-serif" }}
          />
          <div style={{ marginTop: 3 }}>
            <input
              type="checkbox"
              onChange={() => setShowPassword(!showPassword)}
            />
            <label
              htmlFor="showPassword"
              style={{ fontFamily: "Assistant, sans-serif" }}
            >
              Show Password
            </label>
          </div>
        </div>
        <button
          type="submit"
          style={{
            fontFamily: "Assistant, sans-serif",
            margin: "1em",
            backgroundColor: "#6965db",
            border: "none",
            padding: "0.8em 1.5em",
            color: "white",
            borderRadius: 5,
          }}
        >
          {loading ? "..." : "Login"}
        </button>
      </form>
    </div>
  );
};
