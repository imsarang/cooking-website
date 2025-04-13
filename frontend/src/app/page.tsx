"use client";
import "@/styles/home.css";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Carousel from '@/components/recipes/Carousel';

interface MenuInterface {
  image: string,
  text: string,
}
// const SERVER_ENDPOINT = `${process.env.AUTH_SERVER}:${process.env.AUTH_SERVER_PORT}`

const Home =() => {

  const router = useRouter()
  const [token, setToken] = useState("")
  const [currentItem, setCurrentItem] = useState({
    image: "/images/recipes/wadapav.jpg",
    text: "1",
  } as MenuInterface)

  const [dropdown, setDropdown] = useState(false)


  return (
    <div className="main">
      {/* <Header token = {token} setToken={setToken}/>
      <Sidebar token = {token}/> */}
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

// Home.getLayout = function getLayout(page: ReactElement) {
//   return <Layout>{page}</Layout>;
// };

export default Home