const axios = require('axios').default
const createNodeHelpers  = require('gatsby-node-helpers').default
const slug = require('slug')
// This should be changed for production or 
const API_URL = 'https://snipcart-grav-headless.azurewebsites.net'

exports.sourceNodes = async ({boundActionCreators}) => {

    const {createNode} = boundActionCreators

    const data = await fetchProducts()

    data.forEach(x => {
        createNode(x)
    })

    return
}

fetchProducts = async () => {
    const {
        createNodeFactory,
        generateNodeId,
        generateTypeName
    } = createNodeHelpers({
        typePrefix: `Snipcart`
    })

    const ProductNode = createNodeFactory('Product', node => {
        return node
    })

    try
    {
        // This is where we call Grav API.
        const response = await axios.get(`${API_URL}/products`, {
            params: {
                "return-as": "json"
            }
        })

        return response.data.children
            .map(x => x.header)
            .map(x => Object.assign(x, {
                userDefinedId: x.id,
                image: `${API_URL}/${getImagePath(x)}`,
                path: `/products/${slug(x.name)}-${slug(x.id)}`.toLowerCase()
            }))
            .map(ProductNode)
    }
    catch (error) {
        console.log(error)
        throw e
    }
}

function getImagePath(node) {
    if (node.image) {
        let image = Object.keys(node.image)
            .map(x => node.image[x])[0]
            
        return image.path;
    }

    return null;
}