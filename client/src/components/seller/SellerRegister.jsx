import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const SellerRegister = () => {
  const { navigate, axios } = useAppContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      setLoading(true);

      const { data } = await axios.post("/api/seller/register", {
        name,
        email,
        password,
        inviteCode,
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/seller");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-screen flex items-center text-sm text-gray-600"
    >
      <div className="flex flex-col gap-4 m-auto items-start p-8 py-10 min-w-80 sm:min-w-96 rounded-lg shadow-xl border border-gray-200">
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">Seller</span> Registration
        </p>
        <div className="w-full">
          <p>Full Name</p>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Enter your full name"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            required
          />
        </div>

        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="Enter your email"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder="Enter password"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            required
          />
        </div>

        <div className="w-full">
          <p>Seller Invite Code</p>
          <input
            onChange={(e) => setInviteCode(e.target.value)}
            value={inviteCode}
            type="password"
            placeholder="Enter seller registration code"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            required
          />
        </div>

        <button
          disabled={loading}
          className="bg-primary text-white w-full py-2 rounded-md cursor-pointer mt-2 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register as Seller"}
        </button>

        <p className="text-xs text-gray-500 mt-2 text-center w-full">
          Already registered?{" "}
          <span
            onClick={() => navigate("/seller")}
            className="text-primary underline cursor-pointer"
          >
            Login as Seller
          </span>
        </p>
      </div>
    </form>
  );
};

export default SellerRegister;
