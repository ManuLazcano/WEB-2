import React, { useState } from "react";
import { ProductsContext } from "../Contexts/ProductsContext";

function ProductsOnSale() {
    const { productsOnSale, addProductToCart, setProductsOnSale } = React.useContext(ProductsContext);
    const [toggleSort, setToggleSort] = useState(true);

    const tableStyle = {
        width: '30%'    
    }

    const sortByName = () => {
        const sortProductsOnSale = [...productsOnSale];
        if(toggleSort) {
            sortProductsOnSale.sort((a,b) => a.name.localeCompare(b.name)); // Orden ascendente
        } else {    
            sortProductsOnSale.sort((a,b) => b.name.localeCompare(a.name));// Orden desendente
        }
        setToggleSort(!toggleSort);
        setProductsOnSale(sortProductsOnSale);
    }

    return (
        <>
            <table border={1} style={tableStyle}>
                <thead>
                    <tr>
                        <th onClick={sortByName} style={{ cursor: 'pointer' }}>Producto</th><th>Precio</th><th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {productsOnSale.map((product, index) => (
                        <tr key={index}>
                            <td onClick={() => addProductToCart(product)} style={{ cursor: 'pointer' }}>{product.name}</td><td>$ {product.price}</td><td>{product.stock}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export { ProductsOnSale };