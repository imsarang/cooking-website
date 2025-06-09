"use client";

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import '@/styles/auth/home.css'
import CustomForm from './CustomForm'
import ImageComponent from './ImageComponent'
import CustomBtn from './CustomBtn'
import { emailValidation, passwordMatch, passwordValidation } from '@/middleware/auth'
import { storeInLocalStorage } from '@/utils/LocalStorage'
import {APIFetchRequest, fetchServerEndpointAuth} from '@/middleware/common'
import { useDispatch } from 'react-redux'
import { setUser, setIsLoggedIn } from '@/redux/slices/userSlice'

const AuthImage = "/images/auth/AuthImage.jpg"
const LoginText = "Login"
const RegisterText = "Register"
const googleIcon = '/images/auth/google.png'

interface AuthProps {
  email: string
  password: string
  confirmPassword?: string
}

// const SERVER_ENDPOINT = `${process.env.AUTH_SERVER}:${process.env.AUTH_SERVER_PORT}`

const MainSection = () => {

  const router = useRouter()
  const dispatch = useDispatch()
  
  // states
  const [loading, setLoading] = useState<boolean>(false)

  const [toggle, setToggle] = useState<boolean>(true)

  const [loginData, setLoginData] = useState<AuthProps>({
    email: '',
    password: ''
  })

  const [registerData, setRegisterData] = useState<AuthProps>({
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleLoginFormChanges = (name: string, value: string) => {

    setLoginData((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSignupFormChanges = (name: string, value: string) => {

    setRegisterData((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  // functions
  const handleGoogle = () => {
    alert("Use Google Auth");
  }

  const handleToggle = () => {
    setToggle(!toggle)
    console.log(toggle);
  }

  const handleSubmitLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    if (!emailValidation(loginData.email)) {
      alert("Email is not in correct format")
      return
    }
    if (!passwordValidation(loginData.password)) {
      alert("Incorrect Password")
      return
    }

    const result = await APIFetchRequest(
      `${fetchServerEndpointAuth()}/api/auth/login`, 
      'POST', 
      loginData
    )

    if (result.success) 
    {
      // Store user data in Redux
      console.log(`User Logged in : ${result.data} ${result.data.email}`);
      
      dispatch(setUser(result.data))
      dispatch(setIsLoggedIn(true))
      
      // Go to Home Page
      router.push('/')
      setLoading(false)
    }
    else
    {
      alert(`Error while logging in ${result.message || result.error}`)
    }
  }

  const handleRegister = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    if (!emailValidation(registerData.email)) {
      alert("Email is not in correct format")
      return
    }

    if (!passwordValidation(registerData.password)) {
      alert("Password is not proper")
      return
    }

    if (!passwordMatch(registerData.password, registerData.confirmPassword)) {
      alert("Passwords Donot Match")
      return
    }

    // Send to backend
    const result = await APIFetchRequest(`${fetchServerEndpointAuth()}/api/auth/register`, 'POST', registerData)

    if (result?.success) 
    {
      setLoading(false)
      dispatch(setUser(result.user))
      dispatch(setIsLoggedIn(true))
      router.push('/')
    }
    else
    {
      alert(`Unable to sign in : ${result?.message || result?.error}`)
    }
      window.location.reload()
  }
  
  if(loading) return <div className="loading">Loading...</div>
  return (
    <div className='auth-main'>
      <div className={toggle ? 'auth container active' : 'auth container'}>
        <div className='formContainer login'>
          <div className='customFormContainer'>
            <CustomForm
              text={LoginText}
              isLogin={true}
              data={loginData}
              setData={handleLoginFormChanges}
              handleSubmit={handleSubmitLogin}
            />
          </div>
          <div className='socialContainer'>
            <CustomBtn
              text="Google"
              icon={googleIcon}
              customClassName='googleBtn'
              onButtonClick={handleGoogle}
            />
          </div>
        </div>
        <div className='formContainer register'>
          <div className='customFormContainer'>
            <CustomForm
              text={RegisterText}
              isLogin={false}
              data={registerData}
              setData={handleSignupFormChanges}
              handleSubmit={handleRegister}
            />
          </div>
          <div className='socialContainer'>
            <CustomBtn
              text="Google"
              icon={googleIcon}
              customClassName='googleBtn'
              onButtonClick={handleGoogle}
            />
          </div>
        </div>
        <div className='toggleContainer'>
          <div className='toggleBackground'>
            <ImageComponent
              imageSrc={AuthImage}
              layout='fill' />
          </div>
          <div className='toggle'>
            <div className='togglePanel toggleLeft'>
              <p> If you already have an account</p>
              <p> Click on Log In</p>
              <button className='loginBtn' onClick={() => handleToggle()}>Log In</button>
            </div>
            <div className='togglePanel toggleRight'>
              <p> If you donot have an account </p>
              <p> You can click on Register</p>
              <button className='regsiterBtn' onClick={() => handleToggle()}>Register</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainSection