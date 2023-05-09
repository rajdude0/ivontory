import { useCallback, useContext, useEffect, useState } from "react"
import "./Admin.css"
import { AddMoreColorItem, OptionBox, Dropdown, DropdownColorItem, DropdownItem, IconInput, ImageDrop, OptionItem, Textarea, CheckBox, Button } from "./Input"
import { FaLock, FaTshirt, FaRecycle, FaUpload, VscNewFile, FaDollarSign, RiNumbersFill } from "react-icons/all"
import { makeAPI } from "../lib/API"
import { toast  } from "react-toastify";
import { NavContext } from "./NavContext"
import { isDefined } from "../../server/utils"

export const Admin = () => {
    const [size, setSize] = useState([]);
    const [color, setColor] = useState([]);
    const [gender, setGender] = useState([]);
    const [brands, setBrands] = useState([]);
    const [category, setCategory] = useState([]);

    const [bump, forceBump ] = useState({});

    const { setNavState, useNavState } = useContext(NavContext);

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
        const resp = await api('/api/createInventory').post(state);
        if(resp) {
            setSucces(resp);
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


    const handleChange = (e) => {
        const {name, value} = e;
        setState(prev => {
            return { ...prev, [name]: value }
        })
    }

    const addColor = async (e) => {
        const { value, color } = e;
        const [{id}] = await api('/api/createColor').post({ name: value, code: color});
        setColor(prev => ([...prev, {id, color, name: value}]))
    }


    const addCategory = async (e) => {
        const { primary } = e;
         const [{id}] = await api('/api/createCategory').post({ name: primary});
         setCategory(prev => ([...prev, {id, name: primary}]))
    }

    const addBrand = async (e) => {
         const { primary, secondary } = e;  
         const [{id}] = await api('/api/createBrand').post({ name: primary, ...secondary && {origin: secondary}});
         setBrands(prev => ([...prev, {id, name: primary}]))
    }

    const addSize = async (e) => {
        const { primary, secondary } = e;
        const [{id}] = await api('/api/createSize').post({ name: primary,  size: " ", unit: "inch", ...secondary && {short: secondary}});
        setSize(prev => ([...prev, {id, name: primary}]))
   }


    return <form key={bump} onSubmit={onFormSubmit} method="post" className="admin">
            <div className="container">
                <IconInput name="product" placeholder={"Enter product title"} onChange={handleChange} Icon={FaTshirt}/>
                <Textarea name="description" placeholder={"Enter product description"}  onChange={handleChange} />
                <div className="flex">
                    <Dropdown name="category" options={category} addMore={true} morePlaceholder="New Category" onChange={handleChange} onAddMore={addCategory}/>
                    <Dropdown name="brands" options={brands} addMore={true} morePlaceholder="New Brand" hasAddMoreMeta={true}  metaPlaceholder="Origin"  onChange={handleChange} onAddMore={addBrand}/>
                </div>
                <div className="flex">
                    <Dropdown name="gender" options={gender} onChange={handleChange} />
                    <Dropdown name="color" addMore={true} morePlaceholder="New Color" onChange={handleChange} DropdownItemRender={DropdownColorItem} AddMoreRenderer={AddMoreColorItem} options={color} onAddMore={addColor}  />
                    <Dropdown name="size" options={size} onChange={handleChange} addMore={true} hasAddMoreMeta={true} morePlaceholder="Name"  metaPlaceholder="Short" onAddMore={addSize}/>
                </div>
                <div>
                    <ImageDrop name="image" onUpload={handleChange} reset={success}/>
                </div>
                <div className="flex">
                   <IconInput Icon={FaDollarSign} name={"price"} onChange={handleChange} placeholder={"Enter Price"} />
                   <IconInput Icon={RiNumbersFill} name={"count"} onChange={handleChange} placeholder={"Enter Stock Count"} />

                </div>
                <div className="flex center">
                    <Button Icon={VscNewFile} color="primary" size="medium" label={"Create New"} onClick={() => { setState(emptyState); forceBump(Math.random()) }  } />
                    <Button Icon={FaUpload} color="tertiary" size="medium" type="submit" label={"Publish Inventory"} onChange={handleChange} />
                </div>
            </div>
    </form>
}