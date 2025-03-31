"use client";

import React, { useEffect, useState } from 'react'
import "@/styles/recipes/sidebar.css"
import { fetchFromLocalStorage } from '@/utils/LocalStorage';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  token: string,
  logout: ()=>void
}

interface SidebarContent {
  image: string,
  text: string,
  key: number
}

const Sidebar = ({token, logout}: SidebarProps) => {

  const router = useRouter()

  const [openSidebar, setSidebar] = useState(false)

  const [sidebarContent,setSidebarContent] = useState([
    {
      image: "/icons/home.svg",
      text: "Home",
      key:0
    },
    {
      image: "/icons/search.svg",
      text: "Search",
      key:1
    },
    {
      image: "/icons/user.svg",
      text: "Account",
      key:2
    },
    {
      image: "/icons/heart.svg",
      text: "Favourites",
      key:3
    },
    {
      image: "/icons/settings.svg",
      text: "Settings",
      key:4
    },
    {
      image: "/icons/about.svg",
      text: "About",
      key:5
    },
    {
      image: "/icons/contact.svg",
      text: "Contact",
      key:6
    },
    {
      image: "/icons/logout.svg",
      text: "Logout",
      key:7
    },
  ])

  useEffect(()=>{
    if(token == null)
    {
      setSidebarContent(sidebarContent.filter(item=>item.key != 7).concat({
        image:"/icons/logout.svg",
        text:"Login",
        key:7
      }))
    }
    else
    {
      setSidebarContent(sidebarContent.filter(item=>item.key !=7).concat({
        image:"/icons/logout.svg",
        text:"Logout",
        key:7
      }))
    }
  },[token])

  const handleSidebarContent =async (item: SidebarContent)=>{
    console.log(item);
    
    switch(item.key)
    {
      case 2:
        router.push('/account')
        break;
      case 7:
        console.log(item.text);
        
        if(item.text == "Login")
        {
          router.push('/auth')
        }
        else
        {
          await logout()
        }
        break;
      default:
        break;
    }
  }

  return (
    <div className={openSidebar ? 'container-exp' : 'sidebarContainer'}>
      <div className='hamburger' onClick={() => setSidebar(!openSidebar)}>
        <div className='line'></div>
        <div className='line'></div>
        <div className='line'></div>
      </div>
      <div className={`sidebar ${openSidebar ? 'expanded' : ''}`}>
        {
          sidebarContent.map((item, index) => {
            return (
              <div className='sidebar-item' key={index} onClick={()=>handleSidebarContent(item)}>
                <div className='sidebar-item-icon'>
                  <img src={item.image} alt={item.text} />
                </div>
                <div className='sidebar-item-text'>
                  {item.text}
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default Sidebar