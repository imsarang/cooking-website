"use client";

import Sidebar from "@/components/common/Sidebar";
import "@/styles/home.css";
import { useRouter } from 'next/navigation';
import { useEffect, useState, } from 'react';
import { fetchFromLocalStorage, removeFromLocalStorage, storeInLocalStorage } from '@/utils/LocalStorage';
import { APIFetchRequest, APIFetchRequestWithToken, fetchServerEndpoint } from '../../middleware/auth';
import Carousel from '@/components/recipes/Carousel';
import Header from "@/components/common/Header";


interface MenuInterface {
  image: string,
  text: string,
}
// const SERVER_ENDPOINT = `${process.env.AUTH_SERVER}:${process.env.AUTH_SERVER_PORT}`

export default function Home() {

  const router = useRouter()
  const [token, setToken] = useState("")
  const [currentItem, setCurrentItem] = useState({
    image: "/images/recipes/wadapav.jpg",
    text: "1",
  } as MenuInterface)

  const [dropdown, setDropdown] = useState(false)

  useEffect(() => {
    setToken(fetchFromLocalStorage('AccessToken') as string)
  }, [token])

  const logout = async () => {

    setDropdown(!dropdown)

    const result = await APIFetchRequest(`${fetchServerEndpoint()}/api/auth/logout`)
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
    <div className="main">
      <Header token = {token} logout = {logout}/>
      <Sidebar token = {token}/>
      <div className="home">
        <div className='main-content'>
          <div className="content-wrapper">
            <div className='content'>
              <div className='rating'>
                4/5
              </div>
              <div className='cuisine'>
                Indian Veg
              </div>
              <div className='description'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                <span style={{ fontSize: '30px' }}>{currentItem?.text}</span>
              </div>
              <div className='add-to-fav'>
                <button className='add-to-fav-btn'>
                  Add to Favourites
                </button>
              </div>
            </div>
          </div>
          <Carousel
            setCurrentItem={setCurrentItem}
            currentItem={currentItem} />
        </div>
      </div>
    </div>
  );
}
