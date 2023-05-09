import { useState } from "react"
import "./Product.css";
import { FaDollarSign, FaRupeeSign } from "react-icons/fa";

export const ProductBox = ({ children }) => {
    return <div className="productbox">
            {children}
    </div>
}

export const Product = ({ name, images = [], id, price, brand, title}) => {
    const [imgIndex, setImgIndex] = useState(0);

    const changeImage = (index, next) => {
        if(next) {
            setImgIndex((index + 1) % images.length);
            return;
        }
        setImgIndex(index);
    }

    return <div className="product-container">
            <div className="product">
                <div className="images" >
                    {images.map((src, i) => <img key={i} src={src} className={`${imgIndex === i ? 'active': ''}`} />)}
                </div>
                <div className="indicators">
                        {images.map((_, i)=> <div key={i} onClick={() => changeImage(i)} className={`indicator ${imgIndex === i ? 'active': ''} `}></div>)}
                    </div>
          </div>
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