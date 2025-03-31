"use client";

import ProductCard from '@/components/recipes/ProductCard'
import Sidebar from "@/components/recipes/Sidebar";
import "@/styles/home.css";
import { useRouter } from 'next/navigation';
import { useEffect, useState,  } from 'react';
import { fetchFromLocalStorage, removeFromLocalStorage, storeInLocalStorage } from '@/utils/LocalStorage';
import { APIFetchRequest, APIFetchRequestWithToken, fetchServerEndpoint } from '../../middleware/auth';

// const SERVER_ENDPOINT = `${process.env.AUTH_SERVER}:${process.env.AUTH_SERVER_PORT}`

export default function Home() {

  const router = useRouter()
  const [token, setToken] = useState("")

  useEffect(() => {
    setToken(fetchFromLocalStorage('AccessToken') as string)
  }, [token])

  const logout = async () => {
    console.log("LOGOUT");
    
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

  const products = [
    {
      image: '/images/recipes/wadapav.jpg',
      title: 'Wada Pav',
      description: 'Mumbai special Wada Pav',
      rating: 4.5,
      isFavourite: false
    },
    {
      image: '/images/recipes/wadapav.jpg',
      title: 'Wada Pav',
      description: 'Mumbai special Wada Pav',
      rating: 4.5,
      isFavourite: false
    }
  ]

  return (
    <div className="main">
      <Sidebar token={token} logout = {logout}/>
      <div className="home">
        <div className="header">
          Cooking Main
        </div>
        <div className="home-content">
          {
            products.map((product, index) => {
              return (
                <div className="product-card" key = {index}>
                  <ProductCard key={index} image={product.image} title={product.title} description={product.description} rating={product.rating} isFavourite={product.isFavourite} />
                </div>
              )
            })
          }

        </div>
      </div>
    </div>
  );
}
