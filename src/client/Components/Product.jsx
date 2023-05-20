import { useCallback, useState, useRef, useEffect } from "react"
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

    const sliderRef = useRef(null);


    const  setPositionByIndex = useCallback((imgIndex, widthToMove) => {
        const currentTranslate = imgIndex * - widthToMove; 
        setPrevTranslate(currentTranslate);
        setSliderPosition(currentTranslate)
      }, [currentTranslate])
      


    const changeImage = useCallback((index, next, e) => {
        if(next) {
            setImgIndex((index + 1) % images.length);
            return;
        }
        const images = e.target.parentElement.parentElement.children[0].children;
        setPositionByIndex(index, images[index].clientWidth);
        setImgIndex(index);
    }, [setPositionByIndex])


    const getPositionX = (event) => {
        return event.type.includes('mouse') ?  event.pageX : event.touches[0].clientX;
    }

    const setSliderPosition = (currentTranslate) => {
        sliderRef.current.style.transform = `translateX(${currentTranslate}px)`;
    }



    const stopDefaultDrag = useCallback((e) => {
            e.preventDefault();
            e.stopPropagation();
    }, [])

    const touchStart = useCallback((i, e) => {
        setIsDragging(true);
        setStartPos(getPositionX(e))
    }, [])


    const touchEnd = useCallback((e) => {
        const movedBy = currentTranslate - prevTranslate
       if(isDragging) {
        setImgIndex(prev => {
            
            if (movedBy < -60 && imgIndex < images.length - 1) {
               prev= prev + 1;
            }
    
            if (movedBy > 60 && imgIndex > 0) { 
                prev = prev -1;
            }

            setPositionByIndex(prev, e.target.clientWidth);

            return prev;
        });
      }
        setIsDragging(false)

    }, [currentTranslate, isDragging, imgIndex, images, prevTranslate])

    const touchMove = useCallback((e)=> {
        if(isDragging) {
            const currentPosition = getPositionX(e)
            const currentTranslate = prevTranslate + currentPosition - startPos;
            setCurrentTranslate(currentTranslate);
            setSliderPosition(currentTranslate);
        }
    }, [isDragging,  currentTranslate, imgIndex,  images , prevTranslate, startPos])

    const touchEndThrottle = _.throttle(touchEnd, 0);

    return <div className="product-container">
            <div className="product">
                <div className="images" ref={sliderRef}>
                    {images.map((src, i) => <img 
                            onDragStart={stopDefaultDrag}
                            onTouchStart={(e) => touchStart(i, e)}
                            onTouchEnd={touchEndThrottle}
                            onTouchMove={touchMove}

                            onMouseDown={(e) => touchStart(i, e)}
                            onMouseUpCapture={touchEndThrottle}
                            onMouseUp={touchEndThrottle}
                            onMouseLeave={touchEndThrottle}
                            onMouseMove={touchMove}

                            key={i} 
                            src={src} 
                            className={`${imgIndex === i ? 'active': ''}`} 
                            />)}
                </div>
                <div className="indicators">
                        {images.map((_, i)=> <div key={i} onClick={(e) => changeImage(i, null , e)} className={`indicator ${imgIndex === i ? 'active': ''} `}></div>)}
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