import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userDataContext } from "../../context/UserContext";



export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { axios } = useContext(userDataContext);

  console.log("axios", axios); // Check if axios is available

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
         const res = await axios.post("/users/register", {
          username,
          email,
          password,
        },{ withCredentials: true });
        alert("Registration Successful");
        navigate("/dashboard");
    } catch (err) {
      alert("Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Register
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full border p-2 mb-4 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

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

        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Register
        </button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </form>

    </div>
  );
}
