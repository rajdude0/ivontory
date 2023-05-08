import { useContext, useEffect, useRef, useState } from "react";
import "./Home.css";
import { Product, ProductBox } from "./Product";
import { FilterBox } from "./FilterBox";
import { makeAPI } from "../lib/API";
import { DataContext } from "./DataContext";

export const Home = ({ children }) => {
    
    const {inventory, setInventory } = useContext(DataContext);
    
    const api = makeAPI();
    const x = 1;
    
    useEffect(()=> {
        (async () => {
         const  resp =  await api('/api/inventory').get();
         setInventory(resp);
        })()
    }, [x])
   


   return <div className="home container">
         <FilterBox />
         <ProductBox>
            { inventory.map(( {pid, name, brand, images, count, price}) => <Product brand={brand} title={name} id={pid} images={images}
            count={count}
            price={price}/>)
            }

         </ProductBox>
    </div>
}