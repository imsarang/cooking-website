import React from 'react'
import { FaUser, FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useEffect, useState, } from 'react';
import { fetchFromLocalStorage, removeFromLocalStorage, storeInLocalStorage } from '@/utils/LocalStorage';
import { APIFetchRequest, fetchServerEndpointAuth } from '@/middleware/common';
import '@/styles/common/header.css'

interface HeaderInterface {
    token: string
    setToken: React.Dispatch<React.SetStateAction<string>>
}

const Header = ({token, setToken}: HeaderInterface) => {
    const router = useRouter()
    const [dropdown, setDropdown] = useState(false)
    
    useEffect(()=>{
      console.log(token);
      
      if(token!=null) setDropdown(true);
      else setDropdown(false)   
    },[token])

    const handleDropdown = ()=>{
        setDropdown(!dropdown)
      }
    
    const handleLogin = ()=>{
      router.push('/auth')
    }

    const logout = async () => {

      setDropdown(!dropdown)
  
      const result = await APIFetchRequest(`${fetchServerEndpointAuth()}/api/auth/logout`)
      // const result = await APIFetchRequest(`http://backend:3001/api/auth/logout`)
  
      if (!result.success) {
        alert(`Error while logging out : ${result.error || result.message}`)
      }
  
      removeFromLocalStorage('AccessToken')
      setToken("")
      console.log("LOGOUT SUCCESS");
  
      router.push('/')
    }
    
  return (
    <div className='main-menu'>
        <div className='about-section'>
          About
        </div>
        <div className='contact-section'>
          Contact
        </div>
        {
          token == undefined ?
          <div onClick={handleLogin} className='user-login'>
              Login
            </div>
          :
          <div className='user-section'>
            <FaUserCircle className='user-icon' onClick={handleDropdown}/>
            {
            dropdown?
              <div className='user-dropdown'>
                <li>Account</li>
                <li>View Contributions</li>
                <li>History</li>
                <li onClick={logout}>Logout</li>
              </div>
              :<></>
            }
        </div> 
        }
      </div>
  )
}

export default Header