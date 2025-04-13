interface Recipe {
    title: string,
    description: string,
    prepTime: string,
    cookTime: string,
    totalTime: string,
    servings: string,
    cuisine: string,
    category: string,
    difficulty: string,
    author: string,
    image: string,
    video: string,
}

interface Ingredients {
    ingredients: [{
        index: number,
        name: string,
        quantity: string
    }]
}

interface Steps {
    steps: [
        {
            stepNumber: number,
            description: string,
            image?: string,
            video?: string
        }
    ]
}

export function validateRecipe(recipe: Recipe) {
    // console.log(recipe);

    const prepPattern = /^([0-9]*)$/
    const cookPattern = /^([0-9]*)$/
    const totalPattern = /^([0-9]*)$/

    if (recipe.prepTime == '' ||
        recipe.cookTime == '' ||
        recipe.totalTime == '' ||
        !prepPattern.test(recipe.prepTime) ||
        !cookPattern.test(recipe.cookTime) ||
        !totalPattern.test(recipe.totalTime)
    ) {
        return false;
    }
    return true;
}

export function validateIngredients(ingredients: Ingredients) {

    const quantityPattern = /^([0-9]*)$/

    // for (let i = 0; i < ingredients.ingredients.length; i++) {
    //     if (ingredients[i].name === '' ||
    //         ingredients[i].quantity === ''
    //     )
    //     return false
    // }

    return true;
}
