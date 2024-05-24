import React, { useState } from "react";
import { ProductsContext } from "../Contexts/ProductsContext";

function Cart() {
    const { 
        productsInCart, 
        setProductsInCart, 
        deleteOne,
        deleteAll
    } = React.useContext(ProductsContext);
    const [toggleSort, setToggleSort] = useState(true);

    const tableStyle = {
        width: '30%'    
    }

    const sortByName = () => {
        const sortProductsInCart = [...productsInCart];
        if(toggleSort) {
            sortProductsInCart.sort((a,b) => a.name.localeCompare(b.name)); // Orden ascendente
        } else {    
            sortProductsInCart.sort((a,b) => b.name.localeCompare(a.name));// Orden desendente
        }
        setToggleSort(!toggleSort);
        setProductsInCart(sortProductsInCart);
    }
    
    return (
        <table border={1} style={tableStyle}>
            <thead>
                <tr>
                    <th onClick={sortByName} style={{ cursor: 'pointer' }}>Product</th><th>Price</th><th>count</th><th>Total</th><th>Offer?</th><th>Delete one</th><th>Delete all</th>
                </tr>
            </thead>
            <tbody>
                {productsInCart.map((product, index) => (
                <tr key={index}>
                    <td>{product.name}</td>
                    <td>$ {product.price}</td>
                    <td>{product.count}</td>
                    <td>{product.price * product.count}</td>
                    <td>{product.offer ? "Yes" : "No"}</td>
                    <td><button onClick={() => deleteOne(product.name)}>Delete one</button></td>
                    <td><button onClick={() => deleteAll(product.name)}>Delete all</button></td>
                </tr>  
                ))}           
            </tbody>
        </table>
    );
}

export { Cart };