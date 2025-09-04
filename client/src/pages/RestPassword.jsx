import React, { useContext, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const RestPassword = () => {

  const {backendUrl}=useContext(AppContext);
  axios.defaults.withCredentials = true;


  const navigate = useNavigate();
  const [email,setEmail]=useState("")
  const [newPassword,setnewPassword]=useState("")
  const [isEmailSent,setIsEmailSent]=useState(false);
  const [otp,setOtp]=useState(0);
  const [isOtpSubmited,setIsOtpSubmited]=useState(false);
    const inputRefs=useRef([])

      const handleInput=(e,index)=>{
        const value=e.target.value;
        if(value.length===1 && index<5){
            inputRefs.current[index+1].focus();
        }
        if(value.length===0 && index>0){
            inputRefs.current[index-1].focus();
        }
    }
    const onKeyDown=(e,index)=>{
      if(e.key==='Backspace' && index>0 && e.target.value.length===0){
        inputRefs.current[index-1].focus();
      }
    }
    const handlePaste=(e)=>{
      const paste =e.clipboardData.getData('text');
      const pasteValues=paste.split('');
      pasteValues.forEach((value,index)=>{
        if(index<6){
          inputRefs.current[index].value=value;
        }
      })
    }


    const onSubmitEmail=async(e)=>{
      e.preventDefault();
      console.log(email)
      console.log(backendUrl)
      console.log(`${backendUrl}/api/auth/send-rest-otp`)
      try{
        const {data}=await axios.post(`${backendUrl}/api/auth/send-rest-otp`,{email},      { headers: { "Content-Type": "application/json" } })
        if(data?.success){
          toast.success(data?.message)
          setIsEmailSent(true)   
        }else{
          toast.error(data?.message)
        }
        console.log(data)
      }catch(error){
        console.log("Error while sending reset password otp",error)
      }
    }
    
    const onSubmitOTP=async(e)=>{
      e.preventDefault();
      const otpArray=inputRefs.current.map(input=>input.value);
      const enterotp=otpArray.join('');
      setOtp(enterotp)
      setIsOtpSubmited(true)
    }
    const onSubmitNewPassword=async(e)=>{
      e.preventDefault();
      try{
        console.log(email,otp,newPassword)
        console.log(`${backendUrl}/api/auth/rest-password`)
        const {data}=await axios.post(`${backendUrl}/api/auth/rest-password`,{email,otp,newPassword})

        if(data?.success){
          toast.success(data?.message)
          navigate('/login')
        }else{
          toast.error(data?.message)
        }
        console.log(data)
    }
      catch(error){
        console.log("Error while setting new password",error)
      }
  }

  return <div>

            <div className="flex flex-col items-center justify-center  h-screen bg-gradient-to-br from-blue-200 to-purple-400  text-gray-400 gap-4  relative">
                    <img
                      src={assets.logo}
                      alt="logo"
                      
                      onClick={() => navigate("/")}
                      className="absolute left-5 sm:left-20 top-5 w-28 sm;w-32 cursor-pointer"
                      />
                    {/* enter email id */}
                      {!isEmailSent &&
                    <form className='bg-slate-900 p-8 rounded-lg  shadow-lg w-96 '  onSubmit={onSubmitEmail}>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4  '>Rest Password</h1>
                  <p className='text-center mb-6 text-indigo-500 '>Enter your Register Email address</p>
                  <div className=" mb-4 flex items-center gap-3 w-full bg-[#333A5C] bg-opacity-70   rounded-full px-4 py-2
                  ">
                    <img src={assets.mail_icon} alt=""  className="w-3 h-3 "/>
                    <input type="text"  placeholder="Email "
                    required
                    value={email}
                    onChange={e=>setEmail(e.target.value)}
                    className="px-4 py-2 rounded w-64 sm:w-96 focus:outline-none 
                    bg-transparent  text-white "
                    />
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 w-full mt-4">
                    Submit 
                  </button>
                    </form>
        }


      {/* } */}
{isEmailSent && !isOtpSubmited &&
                      <form className='bg-slate-900 p-8 rounded-lg  shadow-lg w-96 '  onSubmit={onSubmitOTP}>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4  '>Reset Password Opt</h1>
                  <p className='text-center mb-6 text-indigo-500 '>Enter the 6 digit code sent to your email</p>

                  <div className="flex justify-between mb-8 " onPaste={handlePaste}>
                    {Array(6).fill(0).map((_,index)=>(
                        <input key={index} type="text" 
                        required
                        ref={e=>inputRefs.current[index]=e}
                        onInput={e=>handleInput(e,index)}
                        onKeyDown={e=>onKeyDown(e,index)}
                        maxLength={1} className='w-10 h-10 text-center text-xl rounded 
                        border 
                        hover:border-white
                        text-white 
                        cursor-pointer  
                        border-gray-400
                        bg-[#333A5C]
                      focus:ring-2  focus:ring-blue-400 
                        focus:border-blue-500 ' />
                    ))

                    }
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 w-full mt-4">
                    Submit
                  </button>
                    </form>

}

                    {isOtpSubmited &&  isEmailSent &&

                    
                                        <form className='bg-slate-900 p-8 rounded-lg  shadow-lg w-96 ' onSubmit={onSubmitNewPassword}>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4  '>New Password</h1>
                  <p className='text-center mb-6 text-indigo-500 '>Enter  the new password below</p>
                  <div className=" mb-4 flex items-center gap-3 w-full bg-[#333A5C] bg-opacity-70   rounded-full px-4 py-2
                  ">
                    <img src={assets.lock_icon} alt="lock"  className="w-3 h-3 "/>
                    <input type="password"  placeholder="new password "
                    required
                    value={newPassword}
                    onChange={e=>setnewPassword(e.target.value)}
                    className="px-4 py-2 rounded w-64 sm:w-96 focus:outline-none 
                    bg-transparent  text-white "
                    />
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 w-full mt-4">
                    Submit 
                  </button>
                    </form>
}
                     </div>  
  </div>
};

export default RestPassword;
