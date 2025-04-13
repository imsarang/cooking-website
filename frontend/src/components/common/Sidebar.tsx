"use client";

import React, { useEffect, useState } from 'react'
import "@/styles/common/sidebar.css"
import { fetchFromLocalStorage } from '@/utils/LocalStorage';
import { useRouter } from 'next/navigation';
import { sidebarContentLoggedOut, sidebasrContentLoggedIn } from '../../../general';


interface SidebarProps {
  token: string,
}

interface SidebarContent {
  image: React.JSX.Element,
  text: string,
  key: number
}

const Sidebar = ({token}: SidebarProps) => {

  const router = useRouter()

  const [openSidebar, setSidebar] = useState(false)

  const [sidebarContent,setSidebarContent] = useState(sidebarContentLoggedOut)

  useEffect(()=>{
    handleTokenChanges()
  },[token])

  const handleTokenChanges = () => {
    console.log(token);
    
    if(token)
    setSidebarContent(sidebasrContentLoggedIn)
    else
    setSidebarContent(sidebarContentLoggedOut)  
  }

  const handleSidebarContent =async (item: SidebarContent)=>{
    console.log(item);
    
    switch(item.key)
    {
      case 0:
        router.push('/')
        break;
      case 2:
        router.push('/account')
        break;
      case 3:
        router.push('/create/recipe')
      default:
        break;
    }
  }

  return (
    <div className={`sidebar-container ${openSidebar ? 'expanded' : ''}`}>
      <div className={openSidebar?'cross':'hamburger'} onClick={() => setSidebar(!openSidebar)}>
        <div className='line'></div>
        <div className='line'></div>
        <div className='line'></div>
      </div>
      <div className={`sidebar`}>
        {
          sidebarContent.map((item, index) => {
            return (
              <div className='sidebar-item' key={index} onClick={()=>handleSidebarContent(item)}>
                <div className='sidebar-item-icon'>
                  {/* <img src={item.image} alt={item.text} /> */}
                  {item.image}
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