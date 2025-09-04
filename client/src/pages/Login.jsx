import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;
    if (state === "Sign Up") {
      const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
        name,
        email,
        password,
      });
      if (data?.success) {
        // alert("Registration Successful");
        toast.success("Registration Successful");
        getUserData();
        setIsLoggedin(true);
        navigate("/");
      } else {
        toast.error("data?.message");
      }
    } else {
      const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password,
      });
      if (data?.success) {
        // alert("Registration Successful");
        toast.success("Login Successfully");
        getUserData();
        setIsLoggedin(true);
        navigate("/");
      } else {
        toast.error("data?.message");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center  h-screen bg-gradient-to-br from-blue-200 to-purple-400  text-gray-800 gap-4  px-4 sm:px-24 relative">
      <img
        src={assets.logo}
        alt="logo"
        onClick={() => navigate("/")}
        className="absolute left-5 sm:left-20 top-5 w-28 sm;w-32 "
      />
      <div className="bg-slate-900 bg-opacity-70 p-6 rounded-lg shadow-md  w-full max-w-md text-sm sm:w-96 text-indigo-300  ">
        <h2 className="text-3xl font-semibold text-white text-center mb-2 ">
          {state === "Sign Up" ? "Create  Account " : "Login  "}
        </h2>
        <p className=" text-center mb-6 text-gray-300 text-sm">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account "}
        </p>
        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className=" mb-4 flex items-center justify-content-center gap-2 bg-[#333A5C] bg-opacity-70  w-full   rounded-full px-4 py-2">
              <img src={assets.person_icon} alt="" />
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-2 rounded w-64 sm:w-96 focus:outline-none bg-transparent  "
              />
            </div>
          )}
          <div className=" mb-4 flex items-center justify-content-center gap-2 bg-[#333A5C] bg-opacity-70  w-full   rounded-full px-4 py-2">
            <img src={assets.mail_icon} alt="email-logo" />
            <input
              type="email"
              placeholder="Email Id"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 rounded w-64 sm:w-96 focus:outline-none bg-transparent  "
            />
          </div>
          <div className=" mb-4 flex items-center justify-content-center gap-2 bg-[#333A5C] bg-opacity-70  w-full   rounded-full px-4 py-2">
            <img src={assets.lock_icon} alt="" />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 rounded w-64 sm:w-96 focus:outline-none bg-transparent  "
            />
          </div>

          <p
            className="m-4   text-indigo-500 cursor-pointer"
            onClick={() => navigate("/Rest-password")}
          >
            Forget password ?
          </p>
          <button className=" w-full py-2.5 rounded-full  bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-semibold hover:from-indigo-600 hover:to-indigo-800 transition duration-300">
            {state}
          </button>
        </form>
        {state === "Sign Up" ? (
          <p className="mt-4 text-center text-gray-300 text-xs">
            Already have a account ?{" "}
            <span
              className="text-blue-400 cursor-pointer underline text-sm"
              onClick={() => setState("Login")}
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="mt-4 text-center text-gray-300 text-xs">
            Don't have account ?{" "}
            <span
              className="text-blue-400 cursor-pointer underline text-sm"
              onClick={() => setState("Sign Up")}
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
