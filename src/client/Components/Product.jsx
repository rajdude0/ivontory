import { useCallback, useState, useRef } from "react"
import "./Product.css";
import { FaDollarSign, FaRupeeSign } from "react-icons/fa";
import _ from "lodash";
export const ProductBox = ({ children }) => {
    return <div className="productbox">
            {children}
    </div>
}

export const Product = ({ name, images = [], id, price, brand, title}) => {
    const [imgIndex, setImgIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState(0);
    const [currentTranslate, setCurrentTranslate] = useState(0);
    const [prevTranslate, setPrevTranslate] = useState(0);

    const animationRef = useRef(null);

    const changeImage = (index, next) => {
        if(next) {
            setImgIndex((index + 1) % images.length);
            return;
        }
        setImgIndex(index);
    }


    const getPositionX = (event) => {
        return event.type.includes('mouse') ?  event.pageX : event.touches[0].clientX;
    }

    const setSliderPosition = (e, currentTranslate) => {
        e.target.style.transform = `translateX(${currentTranslate}px)`;
    }

    const setPositionByIndex = useCallback((e) => {
        const crrT = imgIndex * -e.target.clientWidth;
         setSliderPosition(e, crrT)
         setPrevTranslate(currentTranslate);
    }, [currentTranslate, imgIndex])

    const stopDefaultDrag = useCallback((e) => {
            e.preventDefault();
            e.stopPropagation();
    }, [])

    const touchStart = useCallback((i, e) => {
        console.log("start")
        setIsDragging(true);
        setImgIndex(i);
        setStartPos(getPositionX(e))
    }, [])


    const touchEnd = useCallback((e) => {
        console.log("end")
        setIsDragging(false)
        const movedBy = currentTranslate - prevTranslate;
        if(movedBy < -50 && imgIndex < images.length - 1) {
            setImgIndex(prev => {
                return  prev + 1
                }
              )
        }

        if(movedBy > 50 && imgIndex > 0) {
            setImgIndex(prev => {
               return  prev - 1
             })
        }

    }, [currentTranslate, imgIndex, images, prevTranslate])

    const touchMove = useCallback((e)=> {
        if(isDragging) {
           const currentPosition = getPositionX(e);
           const crrT  = prevTranslate + currentPosition - startPos


           const isLeft = crrT  < 0; 
           console.log("images rect",e.target.getBoundingClientRect());
           console.log("prev", prevTranslate, "curr", currentPosition, "start", startPos, "appar", crrT)
           if(images.length === 1) { return }
           if(isLeft && imgIndex === images.length - 1 || !isLeft && imgIndex === 0 ) {
              
           } else {
            setSliderPosition(e, crrT);
            setCurrentTranslate(crrT); 
           }
        }
    }, [isDragging,  currentTranslate, imgIndex,  images , prevTranslate, startPos])

    const touchEndThrottle = _.throttle(touchEnd, 500);

    return <div className="product-container">
            <div className="product">
                <div className="images">
                    {images.map((src, i) => <img 
                            onDragStart={stopDefaultDrag}
                            onTouchStart={(e) => touchStart(i, e)}
                            onTouchEnd={touchEndThrottle}
                            onTouchMove={touchMove}

                            onMouseDown={(e) => touchStart(i, e)}
                            onMouseUp={touchEndThrottle}
                            onMouseLeave={touchEndThrottle}
                            onMouseMove={touchMove}

                            key={i} 
                            src={src} 
                            className={`${imgIndex === i ? 'active': ''}`} 
                            />)}
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