import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import "./ProductDetail.css"
import { Link, useParams } from "react-router-dom"
import { makeAPI } from "../lib/API"
import { Slider } from "./Slider"
import { Button, OptionBox, OptionItem } from "./Input"
import { FaRupeeSign, FaShoppingBag, FaHeart , FaEllipsisV } from "react-icons/fa";
import { getCookie } from "../lib/utils"
import { AuthContext } from "./AuthContext"

const Options = ({ isAdmin, productid, szcid }) => {

    const [toggle, setToggle] = useState(false);

    const toggleState = () => {
        setToggle(prev => !prev);
    }

    return <div className="optionsbox">
            <Button Icon={FaEllipsisV} size="small" onClick={toggleState} />
            { toggle && <ul className="options">
                 {isAdmin && <li><Link to={`/admin/${productid}?szcid=${szcid}`}>Edit</Link></li>}
            </ul>}
    </div>
}

export const ProductDetailBox = ({ }) => {

    const [products, setProducts] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { isAdmin } = useContext(AuthContext);
    
    const sizes = useMemo(() => {
         return products.map(({size}) => ({...size, value: size.id, name: size.short, actual_name: size.name }));
    }, [products]);

    const genders = useMemo(() => {
        return products.map(({gender}) => ({...gender, value: gender.id, name: gender.short, actual_name: gender.name}));
    }, [products]);

   const colors = useMemo(() => {
    return Object.values(products.reduce((acc, {color}, i ) => {
        acc[color.id] = { ...color, value: color.id, color: color.name};
        return acc;
    }, {}));
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
                <Options isAdmin={isAdmin} productid={products[activeIndex].pid} szcid={products[activeIndex].szcid}/>
                <div className="brand">{products[activeIndex].brands.name}</div>
                <div className="name">{products[activeIndex].name}</div>
                <div className="price"><FaRupeeSign/>{products[activeIndex].price}</div>
                <div className="sizes">
                    <span className="title">Sizes</span>
                    <OptionBox name="size" defaultSelected={sizes[activeIndex].value} type="text" options={sizes} onChange={handleSizeChange} OptionRenderer={OptionItem} />
                </div>
                <div className="colors">
                    <span className="title">Colors</span>
                    <OptionBox name="color" defaultSelected={colors[activeIndex].value} type="color" onChange={handleSizeChange} options={colors} OptionRenderer={OptionItem} />
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