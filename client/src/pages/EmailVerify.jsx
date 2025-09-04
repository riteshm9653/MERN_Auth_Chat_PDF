import React, { useContext, useEffect, useRef } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const EmailVerify = () => {
  const {backendUrl ,isLoggedin,userData,getUserData}=useContext(AppContext);
  const onSubmitHandler=async(e)=>{
    e.preventDefault();
    try{
      const otpArray=inputRefs.current.map(e=>e.value)
      const opt=otpArray.join('');
      if(opt.length<6){
        toast.error("Please enter valid OTP")
      }
      const {data}=await axios.post(`${backendUrl}/api/auth/verify-account`,{otp:opt})

      if(data?.success){
        toast.success(data?.message)
        getUserData();
        navigate("/")
      }else{
        toast.error(data?.message)
      }
    }catch(error){
      toast.error("Error while verifying OTP"+error.message)
      console.error(error)
    }
  }

  const inputRefs=useRef([])
    const navigate = useNavigate();
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


    useEffect(()=>{
      isLoggedin && userData?.isVerified && navigate("/")
    },[isLoggedin,userData])
  return (
    <div>
        <div className="flex flex-col items-center justify-center  h-screen bg-gradient-to-br from-blue-200 to-purple-400  text-gray-400 gap-4  relative">
                <img
                  src={assets.logo}
                  alt="logo"
                  onClick={() => navigate("/")}
                  className="absolute left-5 sm:left-20 top-5 w-28 sm;w-32 cursor-pointer"
                />
                <form className='bg-slate-900 p-8 rounded-lg  shadow-lg w-96 ' onSubmit={onSubmitHandler}>
                  <h1 className='text-white text-2xl font-semibold text-center mb-4  '>Email Verify OTP</h1>
                  <p className='text-center mb-6 text-indigo-500 '>Enter the 6 digit code Sent to your Email  id</p>
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
                  <button className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition 
                  duration-300 mb-4 ' >Verify Email</button>
                  <p className='text-center'>Didn't receive the code ? <span className='text-indigo-500 cursor-pointer'>Resend</span> </p>

                </form>


        </div>

    </div>
  )
}

export default EmailVerify