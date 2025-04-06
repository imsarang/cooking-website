import React, { useState } from 'react'
import "@/styles/recipes/carousel.css"
import CarouselItem from './CarouselItem'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'

interface MenuProps {
    children: React.ReactNode[]
}

const menu = [
    {
        image: "/images/recipes/wadapav.jpg",
        text: "1",
    },
    {
        image: "/images/auth/AuthImage.jpg",
        text: "Lorem ipsum ",
    },
    {
        image: "/images/recipes/wadapav.jpg",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        image: "/images/auth/AuthImage.jpg",
        text: "2"
    },
    {
        image: "/images/recipes/wadapav.jpg",
        text: "sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        image: "/images/auth/AuthImage.jpg",
        text: "consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        image: "/images/recipes/wadapav.jpg",
        text: "adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        image: "/images/auth/AuthImage.jpg",
        text: "tetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        image: "/images/recipes/wadapav.jpg",
        text: " amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
]

interface MenuInterface {
    image:string,
    text:string,
}

interface ItemInterface{
    setCurrentItem: React.Dispatch<React.SetStateAction<any>>
    currentItem?: MenuInterface
}

const Carousel = ({setCurrentItem, currentItem} : ItemInterface) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [rotationAngle, setRotationAngle] = useState(0)

    const handleRight = () => {
        console.log("Left Cicked");

        setCurrentIndex((prev) => (prev - 1 + menu.length) % menu.length)
        setRotationAngle((prev) => prev + (360 / menu.length))
    }
    const handleLeft = () => {

        setCurrentIndex((prev) => (prev + 1) % menu.length)
        setRotationAngle((prev) => prev - (360 / menu.length))
    }

    const handleCarouselItem = (item: any) => {
        // console.log(item);
        setCurrentItem(item)
    }

    return (
        <div className='carousel-container'>
            <div className='carousel'>
                <div
                    className='carousel-wheel-wrapper'
                    style={{
                        // transform: `rotate(${rotationAngle}deg)`,

                        // transform: `translateX(-${currentIndex * 400}px)`
                    }}
                >
                    <div
                        className='carousel-wheel'
                        style={{
                            transform: `translate(-50%, -50%) rotate(${rotationAngle}deg)`,

                        }}>
                        {menu.map((item, index) => {

                            const angle = (360 / menu.length) * index;
                            const radius = 380;
                            const x = (radius * Math.cos(angle * Math.PI / 180)).toPrecision(3);
                            const y = (radius * Math.sin(angle * Math.PI / 180)).toPrecision(3);

                            return (
                                <div
                                    className='carousel-item'
                                    key={index}
                                    onClick={() => handleCarouselItem(item)}
                                    style={{

                                        transform: `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`,
                                    }}

                                >
                                    <img className='carousel-item-img' src={item.image} alt="Carousel Item" />
                                </div>
                            )
                        }
                        )}
                    </div>
                </div>
            </div>

            <div className='carousel-controls'>
                <div className="prev-wrapper">
                    <button className='prev' onClick={handleLeft}>
                        <FaArrowDown />
                    </button>
                </div>
                <div className="next-wrapper">
                    <button className='next' onClick={handleRight}>
                        <FaArrowDown />
                    </button>
                </div>
            </div>

            <div className='carousel-current-item'>
                <img 
                    className='carousel-current-item-image'
                    src={ currentItem?.image }
                    alt={`Image not found`}/>
            </div>
        </div>
    )
}

export default Carousel