import { useState, useEffect, useCallback, useContext } from "react";
import "./FilterBox.css";
import { CheckBox, OptionBox, OptionItem } from "./Input";
import { makeAPI } from "../lib/API";
import { DataContext } from "./DataContext";
import { NavContext } from "./NavContext";


export const FilterType = ({ name , children=[] , direction="column" }) => {
    return <div className={`filtertype ${direction}`}>
           <div className="filtername">{name}</div>
           {children}
    </div>
}

export const FilterBox = ({}) => {
    const [size, setSize] = useState([]);
    const [color, setColor] = useState([]);
    const [gender, setGender] = useState([]);
    const [brands, setBrands] = useState([]);
    const [category, setCategory] = useState([]);

    const {inventory, setInventory} = useContext(DataContext)
    const { navState, setNavState } = useContext(NavContext);

    const [state, setState] = useState({});

    const api = makeAPI();

    useEffect(() => {
        (async () => {
        const urlEncoded = Object.entries(state).reduce((acc, [k, v]) => {
            const encodeEntity =  v ? Array.isArray(v) ? v.map(l => `${encodeURIComponent(k)}=${encodeURIComponent(l)}`).join('&') : `${encodeURIComponent(k)}=${encodeURIComponent(v)}`: ''
            const res = acc ? acc + `&${encodeEntity}`: encodeEntity; 
            return res
        }, "")
        const resp = await api("/api/inventory").get(urlEncoded)
        setInventory(resp);
        })();
    }, [state])


    const handleChange = useCallback((e) => {
        const { name, value} = e;
        setState(prev => {
            return { ...prev, [name]:value}
        })
    }, []);



    const hanldeCheckBoxChange = useCallback((e) => {
        const { name, value} = e;
        const { inputname, checked, value: id} = value
        setState(prev => {
            const prevValue = prev[name];
            if(checked) {
                return { ...prev, [name]: prevValue ? [...prevValue, id]: [id]  }
            } else {
                const prevValue = prev[name];
                const newValue = prevValue.filter(b => b!== id)
                return { [name]: newValue};
            }
        })
    }, []);


    useEffect(() => {
        (async () => {
           const res = await api('/api/inventoryMeta').get()
           if(res) {
           setSize(res.size.map(({ id , name, short, size, unit}) => ({ key: id,  value: id, name: short})))
           setColor(res.color.map(({id, name, code}) => ({ key: id, name, value: id, color: code})))
           setGender(res.gender.map(({id, name, short}) => ({ key: id, value: id, name, short})))
           setBrands(res.brands.map(({id, name, origin}) => ({ key: id, value: id, name, origin})))
           setCategory(res.category.map(({id, name}) => ({ key: id, value: id, name})))
           }
        })()
}, [])


    return <div className="filterbox">
           <div className={`filtercontainer ${!navState.filterOpen ? 'close': 'open'}`}>
              
                <FilterType name={"Size"} >
                     <OptionBox name="size" type="text" options={size} onChange={handleChange}  OptionRenderer={OptionItem}/>
                </FilterType>


                <FilterType name={"Color"} >
                     <OptionBox name="color" type="color" options={color} onChange={handleChange}  OptionRenderer={OptionItem}/>
                </FilterType>


                    <FilterType name={"Brand"}>
                       { brands.map(item => <CheckBox name={item.name} key={item.key} value={item.value} onChange={(e) => hanldeCheckBoxChange({name:'brands', value: e })} label={item.name}/>)}                       
                    </FilterType>
              
                    <FilterType name={"Category"}>
                       { category.map(cat => <CheckBox key={cat.key} name={cat.name} value={cat.value} onChange={(e) => hanldeCheckBoxChange({name:'category', value: e })} label={cat.name}/> )}
                    </FilterType>

                    <FilterType name={"Gender"}>
                       { gender.map(item => <CheckBox name={item.name} key={item.key}  value={item.value} onChange={(e) => hanldeCheckBoxChange({name:'gender', value: e })} label={item.name}/>)}                       
                    </FilterType>
                
           </div>
    </div>
}