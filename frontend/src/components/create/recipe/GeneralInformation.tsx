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
    setRecipe: (name: string, value: string) => void
}

const categoryList = [
    'Dessert',
    'Main Dish',
    'Starters',
    'Siders'
]

const cuisineList = [
    'Indian',
    'Western',
    'European',
    'Asian',
    'Russian'
]

const difficultyList = [
    'Easy',
    'Medium',
    'Hard'
]

const GeneralInformation = ({ ...props }: GeneralInformationInterface) => {

    const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        props.setRecipe(e.target.name as string, e.target.value as string)
    }

    return (
        <div className='general-information'>
            <div className="general-info-header">
                General Information
            </div>
            <div className="general-info-title">
                <div className="general-info-recipe">
                    <FormInput
                        label={"Enter Recipe Name"}
                        type={"input"}
                        name={'title'}
                        value={props.title}
                        setData={props.setRecipe}
                    />
                </div>
                
                <div className="general-info-difficulty">
                    <Dropdown
                    data={difficultyList}
                    current={props.category}
                    setData={props.setRecipe}
                    />
                </div>
            </div>
            <div className="general-info-desc">
                <textarea
                    className='create-desc-message'
                    name="description"
                    value={props.description}
                    onChange={(e) => handleTextArea(e)}
                    rows={5}
                    cols={33}
                    required
                />

                <span
                    className='create-desc-label'>
                    Description
                </span>
            </div>

            <div className="general-info-extras">
                <div className="general-info-category">
                    <Dropdown
                        data={categoryList}
                        current={props.category}
                        setData={props.setRecipe}
                    />
                </div>
                <div className="general-info-cuisine">
                    <Dropdown
                        data={cuisineList}
                        current={props.cuisine}
                        setData={props.setRecipe}
                    />
                </div>
            </div>
            <div className="general-info-duration">
                <div className="general-info-prep-time">
                    <FormInput
                        label={"Preparation Time"}
                        type={"input"}
                        name={'prepTime'}
                        value={props.prepTime}
                        setData={props.setRecipe}
                    />
                </div>
                <div className="general-info-cook-time">
                    <FormInput
                        label={"Cooking Time"}
                        type={"input"}
                        name={'cookTime'}
                        value={props.cookTime}
                        setData={props.setRecipe}
                    />
                </div>
                <div className="general-info-total-time">
                    <FormInput
                        label={"Total Time"}
                        type={"input"}
                        name={'totalTime'}
                        value={props.totalTime}
                        setData={props.setRecipe}
                    />
                </div>
                <div className="general-info-servings">
                    <FormInput
                        label={"Servings"}
                        type={"input"}
                        name={'serving'}
                        value={props.servings}
                        setData={props.setRecipe}
                    />
                </div>
            </div>
        </div>
    )
}

export default GeneralInformation