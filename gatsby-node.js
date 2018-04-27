const slash = require('slash')
const path = require('path')

exports.createPages = async ({graphql, boundActionCreators}) => {
    const { createPage } = boundActionCreators
    const productTemplate = path.resolve('src/components/product.js')

    return graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            frontmatter {
                sku,
                loc,
                price,
                desc,
                private,
                name
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }

    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      createPage({
        path: node.frontmatter.loc,
        component: slash(productTemplate),
        context: {
            sku: node.frontmatter.sku
        }
      });
    });
  });
}