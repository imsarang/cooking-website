import React from 'react'
interface CarouselItemProps {
    index: number,
    image: string,
}
const CarouselItem = ({index, image}:CarouselItemProps) => {
  return (
    <div className='carousel-item' key={index}>
        <img src={image} alt="Carousel Item" className='carousel-item' />
    </div>
  )
}

export default CarouselItem