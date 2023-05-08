import { useContext, useEffect, useRef, useState } from "react";
import "./Home.css";
import { Product, ProductBox } from "./Product";
import { FilterBox } from "./FilterBox";
import { makeAPI } from "../lib/API";
import { DataContext } from "./DataContext";
import { NavContext } from "./NavContext";

export const Home = ({ children }) => {
    
    const {inventory, setInventory } = useContext(DataContext);
    const { setNavState, useNavState } = useContext(NavContext);
    
    const api = makeAPI();
    const x = 1;
    
    useEffect(()=> {
        (async () => {
         const  resp =  await api('/api/inventory').get();
         setInventory(resp);
        })()
    }, [x])

    useEffect(()=> {
            setNavState(prev => ({
                ...prev, isFilterOn: true
            }))
    }, [])

   


   return <div className="home container">
         <FilterBox />
         <ProductBox>
            { inventory.map(( {pid, name, brand, images, count, price}) => <Product brand={brand} title={name} id={pid} images={images}
            count={count}
            price={price}/>)
            }
            {inventory.length === 0 && <h3>Uh! Such Emptiness</h3>}
         </ProductBox>
    </div>
}