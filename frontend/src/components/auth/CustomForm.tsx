"use client";

import { useState } from 'react';
import '@/styles/auth/CustomForm.css'
import FormInput from './FormInput';
import HorizontalLine from './HorizontalLine';

interface AuthProps {
  email: string
  password: string
  confirmPassword?: string
}

interface CustomFormProps {
  text: string
  isLogin: boolean
  data: AuthProps
  setData: (name: string, value: string) => void
  handleSubmit: (e: any) => void
}

const CustomForm: React.FC<CustomFormProps> = ({ text, isLogin, data, setData, handleSubmit }) => {
  const emailLabel = "Email Address"
  const imageSrc = './FoodIcon.svg'

  const passwordLabel = "Password"
  const confirmPasswordLabel = "Confirm Password"
  const horizontalLineTextLogin = "or login with"
  const horizontalLineTextSignUp = "or register with"

  return (
    <form className='form' onSubmit={handleSubmit}>
      <p className={`heading`}> {text} </p>

      <FormInput label={emailLabel} type="text" name='email' value={data.email} setData={setData} />

      <div className='password-confirm'>
        <FormInput label={passwordLabel} type="password" name='password' value={data.password} setData={setData} />

        {
          !isLogin ? <FormInput label={confirmPasswordLabel} name='confirmPassword' type="password" value={data.confirmPassword ? data.confirmPassword : ""} setData={setData} /> : <></>
        }
      </div>

      {
        isLogin ?
          <button className={`submit`} type='submit'>Login</button>
          :
          <button className={`submit`} type='submit' >Register</button>
      }

      {isLogin ?
        <HorizontalLine text={horizontalLineTextLogin} />
        :
        <HorizontalLine text={horizontalLineTextSignUp} />
      }
    </form>
  )
}

export default CustomForm