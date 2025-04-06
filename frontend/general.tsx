import { FaArrowAltCircleLeft, FaArrowAltCircleRight, FaArrowCircleRight, FaHeart, FaHome, FaPlus, FaSearch, FaUser, FaUserCheck } from 'react-icons/fa';
import { FaAutoprefixer, FaBots, FaGear } from 'react-icons/fa6';
import { Preahvihear } from 'next/font/google';

export const sidebarContentLoggedOut = [
    {
        image: <FaHome />,
        text: "Home",
        key: 0
    },
    {
        image: <FaSearch />,
        text: "Search",
        key: 1
    },
    {
        image: <FaBots />,
        text: "Chatbot",
        key: 2
    }
]

export const sidebasrContentLoggedIn = [
    {
        image: <FaHome />,
        text: "Home",
        key: 0
    },
    {
        image: <FaSearch />,
        text: "Search",
        key: 1
    },
    {
        image: <FaBots />,
        text: "Chatbot",
        key: 2
    },
    {
        image: <FaPlus />,
        text: "Add Recipe",
        key: 3
    }
]