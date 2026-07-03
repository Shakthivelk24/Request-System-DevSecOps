import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../../context/UserContext";

export default function Dashboard() {
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");

  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);

  const navigate = useNavigate();
  const { axios } = useContext(userDataContext);

  // Fetch Requests
  const loadData = async () => {
    try {
      const sentRes = await axios.get("/api/requests/sent", {
        withCredentials: true,
      });
      const recRes = await axios.get("/api/requests/received", {
        withCredentials: true,
      });

      setSent(sentRes.data);
      setReceived(recRes.data);
    } catch {
      alert("Session expired. Please login.");
      navigate("/");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Send Request
  const sendRequest = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "/api/requests/send",
        {
          receiverEmail: receiverId,
          message,
        },
        { withCredentials: true },
      );

      setReceiverId("");
      setMessage("");

      loadData();
    } catch (err) {
      console.log("Status:", err.response?.status);
      console.log("Data:", err.response?.data);

      alert(err.response?.data?.error || "Failed to send");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `/api/requests/status/${id}`,
        { status }, // ✅ request body
        { withCredentials: true }, // ✅ config
      );

      loadData();
    } catch (err) {
      console.log(err);
      alert("Update failed");
    }
  };

  // ✅ Logout Function
  const handleLogout = async () => {
    try {
      await axios.get("/api/users/logout", { withCredentials: true }); // backend clears cookie
      navigate("/"); // redirect to login
    } catch {
      alert("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Request Dashboard</h1>

        {/* ✅ Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Send Request */}
      <form
        onSubmit={sendRequest}
        className="bg-white p-4 rounded-xl shadow mb-6 max-w-xl mx-auto"
      >
        <h2 className="font-semibold mb-3">Send Request</h2>

        <input
          placeholder="Receiver Email"
          className="border p-2 w-full mb-3 rounded"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          required
        />

        <textarea
          placeholder="Message"
          className="border p-2 w-full mb-3 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
          Send
        </button>
      </form>

      {/* Requests */}
      <div className="grid md:grid-cols-2 gap-4 max-w-6xl mx-auto">
        {/* Received */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Received</h2>

          {received.map((r) => (
            <div key={r._id} className="border p-3 rounded mb-3">
              <p>
                <b>From:</b> {r.sender.username}
              </p>
              <p>{r.message}</p>

              <p className="text-sm text-gray-500">Status: {r.status}</p>

              {r.status === "pending" && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => updateStatus(r._id, "accepted")}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => updateStatus(r._id, "rejected")}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sent */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Sent</h2>

          {sent.map((r) => (
            <div key={r._id} className="border p-3 rounded mb-3">
              <p>
                <b>To:</b> {r.receiver.username}
              </p>
              <p>{r.message}</p>

              <p className="text-sm text-gray-500">Status: {r.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
