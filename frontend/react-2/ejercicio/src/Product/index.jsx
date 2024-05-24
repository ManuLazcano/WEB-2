import React from "react";

function Product({listOfProducts}) {
    return (
        <>
            {listOfProducts.map((product, index) => (
              <tr key={index}>
                <td>{product.name}</td><td>$ {product.price}</td><td>{product.count}</td><td>{product.price * product.count}</td><td>{product.offer ? "Yes" : "No"}</td>
              </tr>  
            ))}
        </>
    );
}

export { Product };