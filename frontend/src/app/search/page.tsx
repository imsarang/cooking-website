"use client";

import React, { useEffect, useState } from 'react'
import "@/styles/search/home.css"
import FormInput from '@/components/common/FormInput'
import ContentSlider from '@/components/common/ContentSlider';
import { APIFetchRequest, fetchServerEndpointRecipe } from '@/middleware/common';
import { useRouter } from 'next/navigation';

const Search = () => {

  const router = useRouter()

  const [search, setSearch] = useState({
    query: ''
  })

  const [searchResults, setSearchResults] = useState([])

  const [filter, setFilter] = useState({
    carbs: {
      min: 0,
      max: 100
    },
    fats: {
      min: 0,
      max: 100
    },
    protein: {
      min: 0,
      max: 100
    },
    calories: {
      min: 0,
      max: 100
    },
    veg: true,
  })
  const [filterBtn, setFilterBtn] = useState(false)

  useEffect(() => {

  }, [search])

  const handleApplyFilter = () => {

  }

  const handleDiscardFilter = () => {
    setFilterBtn(false)
    setFilter({
      carbs: {
        min: 0,
        max: 100
      },
      fats: {
        min: 0,
        max: 100
      },
      protein: {
        min: 0,
        max: 100
      },
      calories: {
        min: 0,
        max: 100
      },
      veg: true,
    })
  }

  const handleSearch = (name: string, value: string) => {
    setSearch({ ...search, [name]: value })
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {

    console.log(` in handle key down function`);
    // if (e.key === 'Enter') {
      // Call the search function here
      console.log("searching for: ", search.query);

      const searchRecipe = await APIFetchRequest(
        `${fetchServerEndpointRecipe()}/api/recipe/search/${search.query}`,
        'GET',
      )
      console.log(searchRecipe);

      if (searchRecipe.success) {
        setSearchResults(searchRecipe.data)
      } else {
        console.log("Error in fetching data")
      }
    // }

    console.log(`exiting handle key down function`);
    
  }

  const handleSearchRecipe = (id: number)=>{
    router.push(`/recipe/${id}`)
  }

  return (
    <div className="search-main">
      <div className="search">
        <div className={filterBtn ? "search-content-filter" : "search-content"}>
          <div className="search-query">
            <FormInput
              label='Search Recipes'
              type='input'
              name='query'
              value={search.query}
              setData={handleSearch}
              handleKeyDown={handleKeyDown}
            />
             {
          // search.query.length > 0 ?
          searchResults.length > 0 ?
            <div className="search-results">
              {
                searchResults.map((recipe: any, index: number) => {
                  return (
                    <div 
                    className="search-result" 
                    key={index}
                    onClick = {()=>handleSearchRecipe(recipe._id)}
                    >
                      {/* <img src={recipe.image} alt={recipe.name} /> */}
                      <div className="search-result-title">
                        <h3>{recipe.title}</h3>
                      </div>
                      <div className="search-result-category">
                        <p>{recipe.category}</p>
                      </div>
                    </div>
                  )
                })
              }
            </div>
            : <></>
        }

          </div>
          {
            filterBtn ?
              <div className="search-filter">
                <div
                  className='search-filter-btn'
                >
                  <div
                    className="applyBtn"
                    onClick={handleApplyFilter}>
                    Apply
                  </div>
                  <div
                    className='discardBtn'
                    onClick={handleDiscardFilter}
                  >
                    Discard
                  </div>
                </div>
                <div className="filter-content">
                  <div className="filter-category">
                    <ContentSlider
                      label="Carbs"
                      minimum={filter.carbs.min}
                      maximum={filter.carbs.max}
                      step={1}
                      name="carbs"
                      setData={setFilter}
                      units="g"
                    />
                  </div>

                  <div className="filter-category">
                    <ContentSlider
                      label="Protien"
                      minimum={filter.protein.min}
                      maximum={filter.protein.max}
                      step={1}
                      name="protein"
                      setData={setFilter}
                      units="g"
                    />
                  </div>

                  <div className="filter-category">
                    <ContentSlider
                      label="Fats"
                      minimum={filter.fats.min}
                      maximum={filter.fats.max}
                      step={1}
                      name="fats"
                      setData={setFilter}
                      units="g"
                    />
                  </div>

                  <div className="filter-category">
                    <ContentSlider
                      label="Calories"
                      minimum={filter.calories.min}
                      maximum={filter.calories.max}
                      step={1}
                      name="calories"
                      setData={setFilter}
                      units="g"
                    />
                  </div>

                </div>
              </div>
              :
              <div
                className="search-filter"
              >
                <button
                  className="filter-btn"
                  onClick={() => setFilterBtn(!filterBtn)}
                >
                  Filter
                </button>
              </div>
          }

        </div>
        {/* include search bar, filters */}
      </div>
      <div className="recommended">
        RECOMMENDED RECIPES
        {/* include 5-10 recipes in drawing cards fashion */}
      </div>
    </div>
  )
}

export default Search