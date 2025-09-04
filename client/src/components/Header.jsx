import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

const Header = () => {
  const { userData  } = useContext(AppContext);
  const navigate = useNavigate();
  useEffect(()=>{

  },[userData])
  const getStarted=()=>{
    console.log("user is ",userData)
    if(userData){
      toast.success("You are already logged in")
      navigate("/dashboard")

    }else{
      toast.error("Please login to get started")
    }
  }

  return (
    <div className="flex flex-col items-center text-center text-gray-800 gap-4 mt-10 px-4 sm:px-24">
      {/* Robot with float animation */}
      <img
        src={assets.header_img} // <-- your robot image
        alt="robot"
        className="w-36 h-36 rounded mb-6 animate-float"
      />

      <h1 className="text-xl sm:text-3xl font-medium mb-2 flex items-center gap-2">
        Hey
        {userData ? ` , ${userData?.name} ` : " Developer "} !
        <img
          src={assets.hand_wave} // <-- your handshake image
          alt="handshake"
          className="w-10 animate-pulseShake"
        />
      </h1>

      <h2 className="text-3xl sm:text-5xl font-semibold">Welcome to our App</h2>
      <p className="text-gray-600 max-w-xl">
        Let’s start with a quick product tour and we’ll have you up and running
        in no time
      </p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300" onClick={getStarted}>
        Get Started
      </button>
    </div>
  );
};

export default Header;
