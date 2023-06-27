
import { useMemo, useState, useCallback, useEffect, useRef } from "react"
import _ from "lodash";
import "./Slider.css"
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

export const Slider = ({
  onChange = () => {},
  images = [],
  classNames = [],
  height = 350,
  width = 250,
}) => {

    const [imgIndex, setImgIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState(0);
    const [currentTranslate, setCurrentTranslate] = useState(0);
    const [prevTranslate, setPrevTranslate] = useState(0);

    const sliderRef = useRef(null);


    const classes = useMemo(() => {
        return classNames.join(" ");
    }, [classNames])


    useEffect(() => {
        onChange(imgIndex, images[imgIndex]);
    }, [imgIndex])


    const  setPositionByIndex = useCallback((imgIndex, widthToMove) => {
        const currentTranslate = imgIndex * - widthToMove; 
        setCurrentTranslate(0);
        setPrevTranslate(currentTranslate);
        setSliderPosition(currentTranslate)
      }, [currentTranslate])
      


    const changeImage = useCallback((index, next, e) => {
        if(next) {
            setImgIndex((index + 1) % images.length);
            return;
        }
        setPositionByIndex(index, width);
        setImgIndex(index);
    }, [setPositionByIndex, width])


    const getPositionX = (event) => {
        return event.type.includes('mouse') ?  event.pageX : event.touches[0].clientX;
    }

    const setSliderPosition = (currentTranslate) => {
        sliderRef.current.style.transform = `translateX(${currentTranslate}px)`;
    }



    const stopDefaultAction = useCallback((e) => {
            e.preventDefault();
            e.stopPropagation();
    }, [])

    const touchStart = useCallback((i, e) => {
        setIsDragging(true);
        setStartPos(getPositionX(e))
    }, [])


    const touchEnd = useCallback((e) => {
        const movedBy = currentTranslate - prevTranslate
       if(isDragging && currentTranslate!==0) {
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

    useEffect(() => {
        console.log(isDragging, imgIndex, prevTranslate, currentTranslate);
    }, [isDragging, imgIndex, prevTranslate, currentTranslate])

    const touchMove = useCallback((e)=> {
        if(isDragging) {
            const currentPosition = getPositionX(e)
            const currentTranslate = prevTranslate + currentPosition - startPos;
            setCurrentTranslate(currentTranslate);
            setSliderPosition(currentTranslate);
        }
    }, [isDragging,  currentTranslate, imgIndex,  images , prevTranslate, startPos])

    const touchEndThrottle = _.throttle(touchEnd, 0);

    const handleLeftSlideButton = useCallback(() => {
            setImgIndex((currentIndex) => {
               const newIndex = (images.length + --currentIndex) % images.length;
               setPositionByIndex(newIndex, width);
               return newIndex
            })
    }, [images, width]);

    const handleRightSlideButton = useCallback(()=> {
            setImgIndex(currentIndex => {
                    const newIndex = ++currentIndex % images.length;
                    setPositionByIndex(newIndex, width);
                    return newIndex;
            })
    }, [images, width])

  return <div className={`slider-container ${classes}`} style={{height:`${height}px`, width:`${width}px`}}>
            <div className="slide-button left" onClick={handleLeftSlideButton}><FaAngleLeft /></div>
            <div className="slide-button right" onClick={handleRightSlideButton}><FaAngleRight /></div>
            <div className="slider" ref={sliderRef}>
                {images.map((src, i) => <img
                onDragStart={stopDefaultAction}
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
                className={`${imgIndex === i
                ? 'active'
                : ''}`}
                style={{height:`${height}px`, width:`${width}px`}}
                />)}
            </div>
            <div className="indicators">
                {images.map((_, i)=> <div key={i} onClick={(e) => changeImage(i, null , e)} className={`indicator ${imgIndex === i ? 'active': ''} `}></div>)}
            </div>
  </div>

}