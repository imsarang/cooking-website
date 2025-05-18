import React from 'react'
import '@/styles/create/media.css'
import { FaPlus } from 'react-icons/fa'

interface MediaProps {
    media: {
        image: string,
        video: string
    },
}

const Media = ({ ...props }: MediaProps) => {
    return (
        <div
            className='create-recipe-media'>
            <div className="create-media-image">
                <div className="media-image">
                    {
                        props.media.image != '' ?
                            <img
                                src={props.media.image}
                                alt="Image not found"
                                className="media-img"
                            />
                            :
                            <img
                                src="/images/recipes/chef.png"
                                alt="Image not found"
                                className="media-img"
                            />
                    }
                </div>
                {/* <div
                    className="upload-image-btn-wrapper"
                >
                    <span className="upload-image-btn">
                        Upload image
                    </span>
                    <button
                        className="upload-image-btn"
                    >
                        <FaPlus />
                    </button>
                </div> */}
            </div>
            <div className="create-media-video">
                <div className="media-video">
                    {
                        props.media.video != '' ?
                            <video
                                controls
                                autoPlay
                                muted
                                loop
                                onLoadedMetadata={(e) => e.currentTarget.play()}
                            >
                                <source
                                    src={props.media.video}
                                    type='video/mp4'
                                />
                            </video>
                            :
                            <img
                                src="/images/recipes/chef.png"
                                alt="Image not found"
                                className="media-img"
                            />
                    }
                </div>
            </div>
        </div>
    )
}

export default Media