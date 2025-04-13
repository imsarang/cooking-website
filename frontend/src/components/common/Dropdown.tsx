import React from 'react'
import "@/styles/common/dropdown.css"
import { FaAngleDown, FaArrowDown } from 'react-icons/fa'

interface DropdownInterface{
    data: string[],
    current: string,
    setData: (name: string, value: string) => void
}

const Dropdown = ({...props}: DropdownInterface) => {
  
    const handleDropdownChange = (e:React.ChangeEvent<HTMLSelectElement>)=>{
        props.setData(e.target.name as string, e.target.value as string)
    }

    return (
    <div className='dropdown'>
        <select 
        name="category" 
        className='dropdown-select'
        onChange={(e)=>handleDropdownChange(e)}
        value={props.current}
        >
          {
            props.data.map((item, index)=>(
                <option
                className='dropdown-item'
                value = {item}
                key={index}
                >{item}</option>
            ))
          }
        </select>

        <div className="down-arrow">
            <FaAngleDown/>
        </div>
    </div>
  )
}

export default Dropdown