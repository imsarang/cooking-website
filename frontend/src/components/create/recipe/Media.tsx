import React from 'react'
import '@/styles/create/media.css'
import { FaPlus } from 'react-icons/fa'

interface MediaProps {
    handleAddBtnClick: () => void,
    handleChangeImage: (e: React.ChangeEvent<HTMLInputElement>) => void
    imageRef: React.RefObject<null>,
    media: {
        image: string,
        video: string
    },
    handleAddVideoBtnClick: () => void,
    handleChangeVideo: (e: React.ChangeEvent<HTMLInputElement>) => void,
    videoRef: React.RefObject<null>,
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
                <input
                    type="file"
                    className="input-for-add-image"
                    style={{ display: 'none' }}
                    name='image'
                    ref={props.imageRef}
                    onChange={(e) => props.handleChangeImage(e)}
                />
                <div
                    className="add-image-btn-wrapper"
                    onClick={props.handleAddBtnClick}
                >
                    <span className="add-image-text">
                        Choose File
                    </span>
                    <button
                        className="add-image-btn"
                    >
                        <FaPlus />
                    </button>
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
                <input
                    type="file"
                    accept='video/*'
                    className="input-for-add-video"
                    style={{ display: 'none' }}
                    name='video'
                    ref={props.videoRef}
                    onChange={(e) => props.handleChangeVideo(e)}
                />
                <div
                    className="add-video-btn-wrapper"
                    onClick={props.handleAddVideoBtnClick}
                >
                    <span className="add-video-text">
                        Choose File
                    </span>
                    <button
                        className="add-video-btn"
                    >
                        <FaPlus />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Media