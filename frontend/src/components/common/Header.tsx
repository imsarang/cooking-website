import React from 'react'
import { FaUser, FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useEffect, useState, } from 'react';
import '@/styles/common/header.css'

interface HeaderInterface {
    token: string
    logout: ()=>Promise<void>
}

const Header = ({token, logout}: HeaderInterface) => {
    const router = useRouter()
    const [dropdown, setDropdown] = useState(false)
    
    const handleDropdown = ()=>{
        setDropdown(!dropdown)
      }
    
      const handleLogin = ()=>{
        router.push('/auth')
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