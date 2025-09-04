import React, { useContext } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContext);

    const sendVerificationOtp = async () => {
      try{
        axios.defaults.withCredentials = true;
        const {data} = await axios.post(`${backendUrl}/api/auth/send-verify-otp`)
        if(data?.success){
          toast.success(data?.message)
          navigate("/email-verify")
          toast.success("OTP sent to your email")

        }else{
          toast.error(data?.message)
        }
      }catch(error){
        console.log("Error while sending verification otp",error)
        toast.error("Error while sending verification otp")
      }
    }

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      data?.success && setIsLoggedin(false);
      data?.success && setUserData(false);
      navigate("/");
    } catch (error) {
      console.log("Error while logging out", error);
      toast.error("Error while logging out");
    }
  };

  return (
    <div className="w-full flex justify-between items-center px-4 sm:px-24 sm:p-6 py-2  top-0">
      <img src={assets.logo} alt="logo" className="w-28 sm:w-32" />

      {userData ? (
        <div className="w-8 h-8 flex justify-center items-center bg-gray-600 text-white rounded-full cursor-pointer hover:bg-gray-700 transition duration-300 relativei group ">
          {userData.name[0].toUpperCase()}
          <div className=" hidden group-hover:block top-0 right-0 absolute p-4  shadow-lg mt-10  w-48  rounded pt-10 ">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm  rounded shadow-lg">
              {!userData.isVerified && (
                <li className="py-1 px-2 bg-gray-100 text-sm cursor-pointer hover:bg-gray-200 text-black  pr-10 "  onClick={sendVerificationOtp}>
                  Verify Email
                </li>
              )}
              <li className="py-1 px-2 bg-gray-100 text-sm cursor-pointer hover:bg-gray-200 pr-10  text-black font-semibold " onClick={()=>logout()}>
                Log out
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 border border-gray-500 rounded-full px-4 py-2 text-white hover:bg-gray-700 hover:border-white transition duration-300 bg-gray-600"
          onClick={() => navigate("/login")}
        >
          Login <img src={assets.arrow_icon} alt="arrow" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
