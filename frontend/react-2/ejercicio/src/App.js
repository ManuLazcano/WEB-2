import { Cart } from "./Cart";
import { ProductsProvider } from "./Contexts/ProductsContext";
import { ProductsOnSale } from "./ProductsOnSale";

function App() {
  const tableStyle = {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    gap: '30px',
    textAlign: 'center'

  }

  return (
    <main style={tableStyle}>
      <ProductsProvider>
        <Cart />
        <ProductsOnSale />
      </ProductsProvider>
    </main>
  );
}

export default App;
