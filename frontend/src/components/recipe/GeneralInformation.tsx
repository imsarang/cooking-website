import FormInput from '@/components/create/recipe/FormInput'
import React from 'react'
import '@/styles/create/generalInformation.css'
import Dropdown from '@/components/common/Dropdown'

interface CreateRecipeInterface {
    name: string,
    value: string
}

interface GeneralInformationInterface {
    title: string,
    description: string,
    prepTime: string,
    cookTime: string,
    totalTime: string,
    servings: string,
    cuisine: string,
    category: string,
    difficulty: string,
}

const GeneralInformation = ({ ...props }: GeneralInformationInterface) => {

    return (
        <div className='general-information'>
            <div className="general-info-header">
                General Information
            </div>
            <div className="general-info-title">
                <div className="general-info-recipe">
                    {props.title}
                </div>
                
                <div className="general-info-difficulty">
                    {props.difficulty}
                </div>
            </div>
            <div className="general-info-desc">
                <p className="general-info-para">
                    {props.description}
                </p>
            </div>

            <div className="general-info-extras">
                <div className="general-info-category">
                    {props.category}
                </div>
                <div className="general-info-cuisine">
                    {props.cuisine}
                </div>
            </div>
            <div className="general-info-duration">
                <div className="general-info-prep-time">
                    {props.prepTime}
                </div>
                <div className="general-info-cook-time">
                    {props.cookTime}
                </div>
                <div className="general-info-total-time">
                    {props.totalTime}
                </div>
                <div className="general-info-servings">
                    {props.servings}
                </div>
            </div>
        </div>
    )
}

export default GeneralInformation