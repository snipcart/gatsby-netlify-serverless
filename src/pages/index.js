import React from 'react'
import Link from 'gatsby-link'
import styles from './products.module.css'
const netlifyIdentity = require("netlify-identity-widget");

export default class Products extends React.Component {
    constructor(data){
        super(data);

        this.state = {
          products: []
        }
      }

    getProducts(){
        return netlifyIdentity.currentUser() != null
            ? this.props.data.allMarkdownRemark.edges
            : this.props.data.allMarkdownRemark.edges
                .filter(x => !x.node.frontmatter.private)  
    }

    updateProducts(){
        this.setState({ products: this.getProducts() });
    }

    componentDidMount(){
        netlifyIdentity.on("login", user => this.updateProducts());
        netlifyIdentity.on("logout", () => this.updateProducts());
        this.updateProducts();
    }

    render(){
        return (
        <div>
            <h1>Products</h1>
            <div>To login use the email: geeks@snipcart.com with password: admin</div>
            <div>You can read the full blog post <a href="https://snipcart.com/blog/static-forms-serverless-gatsby-netlify">here</a></div>
            <div>You can check the code repo <a href="https://github.com/snipcart/gatsby-netlify">here</a></div>


            <ul className={styles.itemsList}>
                {this.state.products.map((o, index) =>
                    <li key={index} className={styles.item}>
                        <Link to={o.node.frontmatter.loc}>
                            <figure>
                                <img className={styles.image} src={o.node.frontmatter.image} alt={o.node.frontmatter.name}></img>
                                <figcaption className={styles.figCaption}>Buy the {o.node.frontmatter.name} now</figcaption>
                            </figure>
                        </Link>
                    </li>
                )}
            </ul>
        </div>)
    }
}

export const query = graphql`
query allProducts {
    allMarkdownRemark {
        edges {
            node {
                frontmatter {
                    sku,
                    loc,
                    price,
                    desc,
                    private,
                    name,
                    image
                }
            }
        }
    }
}
`