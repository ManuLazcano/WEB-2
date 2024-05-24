import React, { createContext, useState } from "react";

const ProductsContext = createContext();

function ProductsProvider({children}) {
    const [productsOnSale, setProductsOnSale] = useState([
        { name: "Producto 1", price: 45, stock: 5 },
        { name: "Producto 2", price: 85, stock: 2 },
        { name: "Producto 3", price: 15, stock: 15 },
        { name: "Producto 4", price: 45, stock: 12 },
        { name: "Producto 5", price: 25, stock: 52 },
    ]);

    const [productsInCart, setProductsInCart] = useState([
        {name: "Producto 1", price: 45, count: 5, offer: true},
        {name: "Producto 2", price: 85, count: 2, offer: false},
        {name: "Producto 3", price: 15, count: 9, offer: true},
        {name: "Producto 4", price: 45, count: 1, offer: true},
    ]);

    const addProductToCart = (newProduct) => {
        const productFoundInCart = productsInCart.find(product => product.name === newProduct.name);
        const productFoundForSale = productsOnSale.find(product => product.name === newProduct.name);

        if(productFoundForSale.stock > 0) {
            if(productFoundInCart) {
                productFoundInCart.count++;
                setProductsInCart([...productsInCart]);
            } else { 
                newProduct.count = 1;
                setProductsInCart([...productsInCart, newProduct]);
            }
            productFoundForSale.stock--;           
            setProductsOnSale([...productsOnSale]); // TO-DP: Restar cantidad
        }
    }

    const deleteOne = (productName) => {
        const productToBeDeleted = productsInCart.find(product => product.name === productName);        
        const productFoundForSale = productsOnSale.find(product => product.name === productName);

        if(productToBeDeleted.count > 1) {
            productToBeDeleted.count--;
            setProductsInCart([...productsInCart]);
        } else {
            const newProductsInCart = productsInCart.filter(product => product.name !== productName);
            setProductsInCart(newProductsInCart);
        }
        productFoundForSale.stock++;
        setProductsOnSale([...productsOnSale]);
    }

    const deleteAll = (productName) => { 
        const productToBeDeleted = productsInCart.find(product => product.name === productName);
        const productFoundForSale = productsOnSale.find(product => product.name === productName);
        
        productFoundForSale.stock += productToBeDeleted.count;
        const newProductsInCart = productsInCart.filter(product => product.name !== productName);
        setProductsInCart(newProductsInCart);
        setProductsOnSale([...productsOnSale]);
    }

    return (
        <ProductsContext.Provider value={{
            productsOnSale,
            productsInCart,
            addProductToCart,
            setProductsInCart,
            setProductsOnSale,
            deleteOne,
            deleteAll
        }}>
            {children}
        </ProductsContext.Provider>
    ); 
}

export { ProductsProvider, ProductsContext };