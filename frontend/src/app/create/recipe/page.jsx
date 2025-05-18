"use client";

import React, { useRef } from 'react'
import { useRouter } from 'next/navigation'

import FormInput from '@/components/common/FormInput';
import "@/styles/create/recipe.css"

import { useState, useEffect } from "react"

import GeneralInformation from '@/components/create/recipe/GeneralInformation'
import Ingredients from '@/components/create/recipe/Ingredients'
import Steps from '@/components/create/recipe/Steps'
import Media from '@/components/create/recipe/Media'

import { validateRecipe, validateIngredients } from '@/middleware/recipe'
import { APIFetchRequestWithToken,APIFetchRequestWithTokenFormData, fetchServerEndpointRecipe } from '@/middleware/common'
import {fetchFromLocalStorage} from '@/utils/LocalStorage'
import Nutrition from '@/components/create/recipe/Nutrition';

const sampleRecipe = {
  title: "Classic Pancakes",
  description: "Fluffy and delicious pancakes perfect for breakfast.",
  prepTime: 10,
  cookTime: 15,
  totalTime: 25,
  servings: 2,
  cuisine: "American",
  category: "Breakfast",
  difficulty: "Easy",
  author: "6616d07eb342be74cb7fa408", // Sample ObjectId
  tags: ["easy", "breakfast"],
};

const sampleNutrition = {
  calories: 350,
  protein: "8g",
  fat: "10g",
  carbs: "55g",
}
const sampleIngredients = [
  { index: 0, name: "Flour", quantity: "1 cup" },
  { index: 1, name: "Milk", quantity: "1 cup" },
  { index: 2, name: "Egg", quantity: "1 large" },
]

const sampleSteps = [
  {
    stepNumber: 1,
    description: "Whisk all the ingredients together until smooth.",
  },
  {
    stepNumber: 2,
    description: "Pour onto a hot griddle and cook until golden.",
  },
]

const recipe = () => {

  const router = useRouter()
  const [token, setToken] = useState("")

  const imageRef = useRef(null)
  const videoRef = useRef(null)

  const [load,setLoad] = useState(false)
  // const [selectedFile, setSelectedFile] = useState('')

  const [recipe, setRecipe] = useState({
    title: "",
    description: "",
    prepTime: "",
    cookTime: "",
    totalTime: "",
    servings: "",
    cuisine: "",
    category: "",
    difficulty: "",
    author: "",
    image: "",
    video: ""
  })

  const [nutrition, setNutrition] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    // add more if needed
  })

  const [ingredients, setIngredients] = useState([{
    index: Date.now(),
    name: "",
    quantity: ""
  },])

  const [steps, setSteps] = useState(
    [{
      stepNumber: 0,
      description: "",
      image: "",
      video: ""
    }]
  )

  const [media, setMedia] = useState({
    image: "",
    video: ""
  })

  const [imageFile, setImageFile] = useState('')
  const [videoFile, setVideoFile] = useState('')

  useEffect(()=>{
    setToken(fetchFromLocalStorage("AccessToken"))
    setRecipe(sampleRecipe)
    setIngredients(sampleIngredients)
    setSteps(sampleSteps)
    setNutrition(sampleNutrition)
  },[])

  const handleCreateRecipe = (name, value) => {
    setRecipe({ ...recipe, [name]: value })
  }

  const handleAddNutrition = (name, value) => {
    setNutrition({ ...nutrition, [name]: value })
  }

  const handleCreateIngredients = (e) => {
    const index = Number(e.target.dataset.index)
    const { name, value } = e.target

    if (Number.isNaN(index)) return

    setIngredients((prev) =>
      prev.map((item, i) => (
        i === index ? { ...item, [name]: value } : item
      ))
    )

  }

  const handleRemoveIngredient = (e) => {
    const action = e.target.closest('[data-action]');
    // console.log(action.dataset);

    if (action.dataset.action === "remove") {
      setIngredients((prev) => prev.filter((_, index) => index != Number(action.dataset.index)))
    }
    else return
  }

  const handleAddIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      {
        name: "",
        quantity: "",
        index: Date.now() + Math.random()
      }
    ])
  }

  const handleCreateSteps = (e) => {
    console.log(e.target.dataset);

    const index = Number(e.target.dataset.index)
    const { name, value } = e.target

    if (Number.isNaN(index)) return

    setSteps((prev) =>
      prev.map((item, i) => (
        i === index ? { ...item, [name]: value } : item
      ))
    )
  }

  const handleAddSteps = () => {
    setSteps((prev) => [
      ...prev,
      {
        stepNumber: steps.length,
        description: "",
        image: "",
        video: ""
      }
    ])
  }

  const handleRemoveSteps = (e) => {
    const action = e.target.closest('[data-action]');

    if (action.dataset.action === "remove") {
      setSteps((prev) => prev.filter((_, index) => index != Number(action.dataset.index)))
    }
    else return
  }

  const handleAddBtnClick = () => {
    imageRef.current.click()
  }

  const handleChangeImage = (e) => {
    const file = e.target.files[0]
    console.log(file);
    console.log(e.target.value);

    if (file)
    {
      setImageFile(file)
      setMedia((prev) => ({
        ...prev, [e.target.name]: URL.createObjectURL(file)
      })
      )
    }
      
    // send api to backend to upload to aws bucket
  }

  const handleAddVideoBtnClick = ()=>{
    videoRef.current.click()
  }

  const handleChangeVideo = (e) => {
    const file = e.target.files[0]
    console.log(file);
    console.log(e.target.value);

    if (file)
    {
      setVideoFile(file)
      setMedia((prev) => ({
        ...prev, [e.target.name]: URL.createObjectURL(file)
      })
      )
    }
  }

  const StoreRecipe = async () => {

    // console.log(recipe);
    // console.log(ingredients);
    

    if (!validateRecipe(recipe)) {
      alert("General Information is not proper")
    }

    if (!validateIngredients(ingredients)) {
      alert("Ingredients not proper")
    }
   
    
    try{
      setLoad(true)
    const formData = new FormData()
    formData.append("imageFile", imageFile)
    formData.append("recipe", JSON.stringify(recipe))
    formData.append("ingredients", JSON.stringify(ingredients))
    formData.append("steps", JSON.stringify(steps))
    formData.append("videoFile", videoFile)
    formData.append("nutrition", JSON.stringify(nutrition))
    
    const uploadMedia = await APIFetchRequestWithTokenFormData(
      `${fetchServerEndpointRecipe()}/api/recipe/create`,
      token,
      'POST',
      formData
    )

    if(!uploadMedia.ok)
      throw new Error("Image not Uploaded")
    
    setLoad(false)
    router.push('/')

  }catch(err){
    throw new Error(err)
  }

    // send api to store
    // send api to upload to s3
  }

  return (
    <div className='create-recipe-container'>
      <div className='create-recipe-header'>
        <div className="create-header-start">
          <div className='create-recipe-header-icon'>

          </div>
          <div className='create-recipe-header-text'>
            Add New Recipe
          </div>
        </div>
        <div className='create-recipe-header-add'>
          <button
            className="add-recipe"
            onClick={StoreRecipe}>
            Create Recipe
          </button>
        </div>
      </div>
      <div className="create-recipe-main">

        <div className="create-recipe-text">
          <GeneralInformation
            title={recipe.title}
            description={recipe.description}
            prepTime={recipe.prepTime}
            cookTime={recipe.cookTime}
            totalTime={recipe.totalTime}
            servings={recipe.servings}
            cuisine={recipe.cuisine}
            category={recipe.category}
            difficulty={recipe.difficulty}
            author={recipe.author}
            setRecipe={handleCreateRecipe}
          />
          <Nutrition
            nutrition={nutrition}
            setNutrition = {setNutrition}
          />

          <Ingredients
            ingredients={ingredients}
            handleRemoveIngredient={handleRemoveIngredient}
            handleAddIngredient={handleAddIngredient}
            handleCreateIngredients={handleCreateIngredients}
          />

          <Steps
            steps={steps}
            handleRemoveSteps={handleRemoveSteps}
            handleAddSteps={handleAddSteps}
            handleCreateSteps={handleCreateSteps}
          />
        </div>
        <Media
          handleAddBtnClick={handleAddBtnClick}
          handleChangeImage={handleChangeImage}
          imageRef={imageRef}
          media={media}
          handleAddVideoBtnClick={handleAddVideoBtnClick}
          handleChangeVideo={handleChangeVideo}
          videoRef={videoRef}
        />
      </div>
      {
        load?<div className="loading-screen">
          Uploading...
        </div>
        :<></>
      }
    </div>

  )
}

export default recipe