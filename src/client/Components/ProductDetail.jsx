import { useCallback, useEffect, useMemo, useState } from "react"
import "./ProductDetail.css"
import { useParams } from "react-router-dom"
import { makeAPI } from "../lib/API"
import { Slider } from "./Slider"
import { Button, OptionBox, OptionItem } from "./Input"
import { FaRupeeSign, FaShoppingBag, FaHeart } from "react-icons/fa";

export const ProductDetailBox = ({ }) => {

    const [products, setProducts] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    
    const sizes = useMemo(() => {
         return products.map(({size}) => ({...size, name: size.short, actual_name: size.name }));
    }, [products]);

    const genders = useMemo(() => {
        return products.map(({gender}) => ({...gender, name: gender.short, actual_name: gender.name}));
    }, [products]);

   const colors = useMemo(() => {
    return products.map(({color}) => ({ ...color, color: color.name}));
   }, [products]);


   const images = useMemo(() => {
        return products[activeIndex]?.images.map(src => location.origin + "/" + src) ?? []
   }, [products, activeIndex]);

    const { pid } = useParams()
    const api = makeAPI();

   const sliderProps = useMemo(() => {
        let width = 500;
        let height = 700;
       if(window.innerWidth <= 800) {
            width=300;
            height=500;
       }
        return {
            height,
            width,
            showMiniMap: true
        }
   }, [])


   const handleSizeChange = useCallback(() => {

   })

    useEffect(() => {   
        (async()=> {
          const res = await api("/api/product/" + pid).get();
          setProducts(res);
        })()
    }, [pid])


    return products.length > 0 && <div className="productdetailbox">
          <div className="slider">
            <Slider images={images} {...sliderProps} classNames={["slider-embillish"]}/>
          </div>
            <div className="detailscontainer">
                <div className="brand">{products[activeIndex].brand.name}</div>
                <div className="name">{products[activeIndex].name}</div>
                <div className="price"><FaRupeeSign/>{products[activeIndex].price}</div>
                <div className="sizes">
                    <span className="title">Sizes</span>
                    <OptionBox name="size" type="text" options={sizes} onChange={handleSizeChange} OptionRenderer={OptionItem} />
                </div>
                <div className="colors">
                    <span className="title">Colors</span>
                    <OptionBox name="color" type="color" onChange={handleSizeChange} options={colors} OptionRenderer={OptionItem} />
                </div>
                
                
               <div className="actions">
               <div className="buynow">
                    <Button label={"Buy Now"} Icon={FaShoppingBag} color="tertiary"/>
                </div>
                <div className="wishlist"> <Button label={"Add to Wishlist"} Icon={FaHeart} color="secondary"/></div>
               </div>
               <div className="description">
                <span className="title">Description</span>
                    {products[activeIndex].desc}
                </div>
            </div> 
        </div>
}