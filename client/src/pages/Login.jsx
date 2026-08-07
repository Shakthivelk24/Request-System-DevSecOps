import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../../context/UserContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { axios } = useContext(userDataContext);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "/users/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );

      navigate("/dashboard");
    } catch (err) {
      alert("Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Login
        </button>

        <p className="text-center mt-4">
          Don't have an account?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}
