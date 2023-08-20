import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import "./Admin.css"
import { AddMoreColorItem, OptionBox, Dropdown, DropdownColorItem, DropdownItem, IconInput, ImageDrop, OptionItem, Textarea, CheckBox, Button } from "./Input"
import { FaLock, FaTshirt, FaRecycle, FaUpload, FaDollarSign } from "react-icons/fa"
import { RiNumbersFill } from "react-icons/ri";
import { VscNewFile } from 'react-icons/vsc';

import { makeAPI } from "../lib/API"
import { toast  } from "react-toastify";
import { NavContext } from "./NavContext"
import { isDefined } from "../../server/utils"
import { useParams, useSearchParams } from "react-router-dom";

export const Admin = () => {
    const [size, setSize] = useState([]);
    const [color, setColor] = useState([]);
    const [gender, setGender] = useState([]);
    const [brands, setBrands] = useState([]);
    const [category, setCategory] = useState([]);

    const [product, setProduct] = useState({});

    const [defaultImageFiles, setDefaultImageFiles] = useState([]);

    const [bump, forceBump ] = useState({});

    const { setNavState, useNavState } = useContext(NavContext);

    const { pid } = useParams();
    const [searchParmas] = useSearchParams();
    const szcid = searchParmas.get("szcid");

    useEffect(()=> {
            setNavState(prev => ({
                ...prev, isFilterOn: false
            }))
    }, [])


    const [success, setSucces] = useState(false)

    const emptyState = {
        product: null,
        description: null,
        category: [],
        brands: [],
        gender: null,   
        color: null,
        size: null,
        image: [],
        price: null,
        count: null,

    }

    const [state, setState] = useState(emptyState);

    const api = makeAPI();

    const isUpdate = useMemo(() => {
        return szcid && pid;
    }, [szcid, pid])


    const mrGaurd = useCallback(() => {
        const entries = Object.entries(state);
        for (const [k,v] of entries) {
           if(!isDefined(v) || (Array.isArray(v) && v.length ===0 )) {
               toast.error(`${k} is not filled`)
               if(k==="image") {
                   toast.info("Please click on Upload to upload images!");
               }
               return false;
           }
        }
        return true;
   }, [state]);

    const onFormSubmit = async (e) => {
        e.preventDefault();
        if(!mrGaurd()){
            return ;
        }
        const resp =  isUpdate? await api('/api/updateStock').put({...state, productid: product.pid, stockid: product.sid}) : await api('/api/createInventory').post(state);
        if(resp && !resp.hasOwnProperty('error')) {
            setSucces(resp);
            toast.success("Inventory created!")
        }
    }

    

    useEffect(() => {
            (async () => {
               const res = await api('/api/inventoryMeta').get()
               if(res) {
                setSize(res.size.map(({ id , name, short, size, unit}) => ({ key: id,  value: id, name})))
                setColor(res.color.map(({id, name, code}) => ({ key: id, name, value: id, color: code})))
                setGender(res.gender.map(({id, name, short}) => ({ key: id, value: id, name, short})))
                setBrands(res.brands.map(({id, name, origin}) => ({ key: id, value: id, name, origin})))
                setCategory(res.category.map(({id, name}) => ({ key: id, value: id, name})))
               }
            })()
    }, [])

    useEffect(() => {
            (async () => {
                if(pid && szcid) {
                    const res = await api(`/api/product/${pid}?szcid=${szcid}`).get();

                    // WHAT WE GET
                    //{"size":{"id":"fcc414fd-8be3-421f-827f-ea782d64aee0","name":"Medium","short":"M","size":"","unit":"inch"},
                    //"color":{"id":"d643a84d-fb00-408c-bcb0-4c6236cb5cb3","name":"Red","code":"#e20e0e"},
                    // "gender":{"id":"919addf1-4655-41eb-a21b-171cb5cda0a7","name":"Male","short":"M"}, 
                    // "brands":{"id":"b6968a67-1bc7-4205-9a5a-d051fb79196e","name":"Nike","origin":"USA"},
                    //"pid":"deb17377-13d7-44ee-aa78-0422c2e15d28","szcid":"ce524893-3044-4f81-88b4-9276df1eb18d",
                    //"name":"T-Shirt Red Color Casual Fit",
                    //"desc":"Beautifully Designed Nike T-Shirt Color Red, casual fit","sid":"a955d3b2-8800-4dcd-bad6-8b695676236c",
                    // "images":["JSaTihby3hUHmDgv42GC8-cab664addcd99efa4394c26f1c220092.jpg","-MvrMwlotZx_Bzxz7HVlT-f2450aa4db175234e983cd5a33b5c0f3.jpg","-yDLDxCrr47qJ4X1Qq8Uw-5a36294edb9bbb0d747817da00e4140d.jpg","Mzw1wIhcOSEy37edFiyOP-914285373a2afce570f9392578c4e8d2.jpg","YOtD1_uylJYbcqLDYynkb-6f16227cfbe26a45470ea112a5ab619a.jpg","yXTJOdDdFbQvLqEK1P-q2-fe6d3b8815bcc3c27dede9ce95ffcfb1.jpg","0tkFUrakn-sC4WQBmGRI1-6b9f65213a981660aff5d7c2a5217321.jpg"],
                    // "count":"30","price":"1000"}

                    //WHAT WE WANT
                    // {"product":"Some Tits","description":"extra tits",
                    //   "category":{"value":"b073950f-048f-4d62-8d40-fabcb8f8194b","name":"T-Shirt"},
                    //   "brands":{"value":"b6968a67-1bc7-4205-9a5a-d051fb79196e","name":"Nike"},
                    //   "gender":{"value":"919addf1-4655-41eb-a21b-171cb5cda0a7","name":"Male"},
                    // "color":{"value":"d643a84d-fb00-408c-bcb0-4c6236cb5cb3","name":"Red","color":"#e20e0e"},
                    // "size":{"value":"2f17cddf-f362-4ffd-a83e-f65628faf4b0","name":"Small"},
                    // "image":["wAuMlwG9w_17J_wIUepaW-f70330a95068fd0d0f0d9c527cc87499.jpg","2-1RA8ndQABNzPKYH13zf-ad58c5f659834c46f31b7bfcc3ef9ccc.jpg","BLzsOTtV6_z9N_PV3l_IU-6fa8345dd0956a4894fb32589be504b1.jpg"],
                    // "price":"445","count":"454"}
                    const stateAbleObject = Object.entries(res[0]).reduce((acc, [key, value], i) => {
                        switch(key) {
                            case "size":
                            case "color":
                            case "gender":
                            case "brands":
                            case "category":
                                acc = { ...acc, [key]:  { value: value.id, name: value.name, ...value.color && {color: value.color}}}
                            break;
                            case "name":
                                acc = { ...acc, ['product']: value}
                                break;
                            case "desc":
                                acc = { ...acc, ['description']: value }
                                break;
                            case "images":
                                acc = { ...acc, image: value}
                                break;
                            case "count":
                            case "price":
                                acc = { ...acc, [key]: value}
                            break;
                            default: 
                             break;
                        }
                      
                     return acc;
                    }, {});

                    setState(stateAbleObject);
                    setProduct(res[0]);
                }
            })()
    }, [pid, szcid])


    const handleChange = (e) => {
        let {name, value} = e;
        if(Array.isArray(state[name])) {
            value = [ ...state[name], ...value];
        }
        setState(prev => {
            return { ...prev, [name]: value }
        })
    }

    const addColor = async (e) => {
        const { value, color } = e;
        const [{id}] = await api('/api/createColor').post({ name: value, code: color});
        setColor(prev => ([...prev, {id, value: id, color, name: value}]))
    }


    const addCategory = async (e) => {
        const { primary } = e;
         const [{id}] = await api('/api/createCategory').post({ name: primary});
         setCategory(prev => ([...prev, {id, value: id, name: primary}]))
    }

    const addBrand = async (e) => {
         const { primary, secondary } = e;  
         const [{id}] = await api('/api/createBrand').post({ name: primary, ...secondary && {origin: secondary}});
         setBrands(prev => ([...prev, {id, value:id, name: primary, origin: secondary}]))
    }

    const addSize = async (e) => {
        const { primary, secondary } = e;
        const [{id}] = await api('/api/createSize').post({ name: primary,  size: " ", unit: "inch", ...secondary && {short: secondary}});
        setSize(prev => ([...prev, {id, value: id, name: primary, short: secondary}]))
   }

   const uploadImagesOrderChange = async (images) => {
        const filenames = images.map(img => img.file.name);
        const resp = await api("/api/updateImagesOrder").put({
            images: filenames,
            pid: pid,
            szid: szcid
        });
        if(resp) {
           state.image = filenames; 
           return true;
        } else {
            return false;
        }
   }


    return <form key={bump} onSubmit={onFormSubmit} method="post" className="admin">
            <div className="container">
                <IconInput name="product" value={state.product} placeholder={"Enter product title"} onChange={handleChange} Icon={FaTshirt}/>
                <Textarea name="description" value={state.description} placeholder={"Enter product description"}  onChange={handleChange} />
                <div className="flex">
                    <Dropdown name="category" options={category} addMore={true} selectedValue={state?.category} morePlaceholder="New Category" onChange={handleChange} onAddMore={addCategory}/>
                    <Dropdown name="brands" options={brands} addMore={true} selectedValue={state?.brands} morePlaceholder="New Brand" hasAddMoreMeta={true}  metaPlaceholder="Origin"  onChange={handleChange} onAddMore={addBrand}/>
                </div>
                <div className="flex">
                    <Dropdown name="gender" options={gender} selectedValue={state?.gender} onChange={handleChange} />
                    <Dropdown name="color" addMore={true} selectedValue={state?.color} morePlaceholder="New Color" onChange={handleChange} DropdownItemRender={DropdownColorItem} AddMoreRenderer={AddMoreColorItem} options={color} onAddMore={addColor}  />
                    <Dropdown name="size" options={size} selectedValue={state?.size}  onChange={handleChange} addMore={true} hasAddMoreMeta={true} morePlaceholder="Name"  metaPlaceholder="Short" onAddMore={addSize}/>
                </div>
                <div>
                    <ImageDrop name="image" onUpload={handleChange}  defaultImageFiles={state.image} onImagesOrderChanged={uploadImagesOrderChange}/>
                </div>
                <div className="flex">
                   <IconInput Icon={FaDollarSign} value={state.price} name={"price"} onChange={handleChange} placeholder={"Enter Price"} />
                   <IconInput Icon={RiNumbersFill} value={state.count} name={"count"} onChange={handleChange} placeholder={"Enter Stock Count"} />

                </div>
                <div className="flex center">
                    <Button Icon={VscNewFile} color="primary" size="medium" label={"Create New"} onClick={() => { setState(emptyState); forceBump(Math.random()) }  } />
                    <Button Icon={FaUpload} color="tertiary" size="medium" type="submit" label={`${isUpdate ? 'Update' : 'Publish'} Inventory`} />
                </div>
            </div>
    </form>
}