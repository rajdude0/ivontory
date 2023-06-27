import { useCallback, useState, useRef, useEffect } from "react"
import "./Product.css";
import { FaDollarSign, FaRupeeSign } from "react-icons/fa";
import { Slider } from "./Slider";

export const ProductBox = ({ children }) => {
    return <div className="productbox">
            {children}
    </div>
}

export const Product = ({ name, images = [], id, price, brand, title}) => {
   
    return <div className="product-container">
           <Slider images={images} classNames={["product"]} />
           <div className="details">
                <div className="brand">
                    {brand}
                </div>
                <div className="title">
                        {title}
                </div>
                    <div className="price">
                    <FaRupeeSign /><h4>{price}</h4>
                </div>
          </div>
    </div>
}