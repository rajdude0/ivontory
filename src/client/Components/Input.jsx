import { useCallback, useState, useEffect, useMemo, useRef } from "react"
import "./Input.css"
import { FaSearch, FaCaretDown, FaCaretUp, FaPlus, FaCheck, FaMinusCircle, FaArrowCircleDown, FaDownload } from "react-icons/fa"
import { useDropzone } from "react-dropzone"
import { SketchPicker } from "react-color" 
import { post } from "superagent"

export const IconInput = ({ name, type, placeholder, onChange, size="big", Icon=FaSearch}) => {
    return <div tabIndex={0}  className="textinput search">
              <div className="icon">
                <Icon />
              </div>
            <input name={name} type={type} placeholder={placeholder} onChange={(e) => onChange(e.target)} />
        </div>
}

export const OptionItem = ({name, color, colorCode,  value, selected = false, onSelect}) => {

    const onSelected = useCallback(() => {
        onSelect({name, value});
    }, [name, value]);

    return <div onClick={onSelected} className={`optionitem ${color ? 'color': ''}  ${selected? 'selected': ''}`} style={{backgroundColor: colorCode}}>
            {!color ? name: ''}
    </div>
}

export const OptionBox = ({ name="", onChange, type="text", defaultSelected= "", options = [], OptionRenderer=OptionItem}) => {
        const [selected, setSelected] = useState(defaultSelected);
        const sel = useRef();

        const updateSelected = useCallback((value) => {
            if(sel.current === value.value) {
                sel.current = null
                onChange({name, value: null})
                setSelected(null);
            } else {
                sel.current = value.value
                 setSelected(value.value);
                 onChange({name, value: value.value})
            }
        }, [selected, onChange]);

        return <div className="radioinput">
            {
                options.map(({key, name, value, color}) => <OptionRenderer name={name} value={value} color={type === 'color'} colorCode={color} onSelect={updateSelected} selected={selected === value} />)
            }
        </div>
}


export const AddMoreTextItem = ({ onAdd, hasShort, morePlaceholder="Value", metaPlaceholder="Short", placeholder="Name", onClick = () => {}}) => {
    const [ value, setValue ] = useState({primary: '', secondary: ''});

    const handleAddMore = () => {
        onClick(value);
        setValue({primary: '', secondary: ''});
    }

    const hanldeOnChange = ({target}) => {
        const { value, name } = target;
        setValue(prev => ({...prev, [name]: value}))
    }

    return <div className={`addmoreitem ${hasShort ? 'hasshort': ''}`}>
            <input  name="primary" value={value.primary} onChange={hanldeOnChange} type="text" placeholder={morePlaceholder} className="newitem"/>
            { hasShort && <input name="secondary" value={value.secondary} onChange={hanldeOnChange} type="text" placeholder={metaPlaceholder} className="newitem" />}
            <button type="button" className="add" onClick={handleAddMore}>
                <FaPlus />
            </button>
    </div>
}

export const AddMoreColorItem = ({ placeholder="Enter color name", onClick = () => {}}) => {
    const [ value, setValue ] = useState();
    const [color, setColor] = useState("red");
    const [toggle, setToggle ] = useState(false);
  
    const handleAddMore = () => {
        onClick({value, color});
        setValue('');
        setColor('red');
    }

    const hanldeOnChange = ({ target }) => {
        const { value } = target;
        setValue(value)
    }

    const handleColorChange = (color) => {
        setColor(color.hex);
    }

    const handleToggle = () => {
        setToggle(prev => !prev);
    }

    return <div className="addmoreitem color">
            { toggle && <div className="picker">
               <SketchPicker color={color} onChange={handleColorChange} onChangeComplete={handleColorChange}/>
             </div>
            }

             <div onClick={handleToggle} className="color" style={{backgroundColor:color}}></div>
             <input value={value} onChange={hanldeOnChange} type="text" placeholder={placeholder} className="newitem"></input>
            <button type="button" className="add" onClick={handleAddMore}>
                <FaPlus />
            </button>
    </div>
}


export const DropdownItem = ({name, value, onClick}) => {

    const handleClick = useCallback(()=> {
            onClick({value, name})
    }, [value]);

    return  <div onClick={handleClick} className="dropdownitem">
            {name}
        </div>
}


export const DropdownColorItem = ({name, color, value, onClick}) => {

    const handleClick = useCallback(()=> {
            onClick({value, name, color})
    }, [value]);

    return  <div onClick={handleClick} className="dropdownitem color">
                <div className="color" style={{backgroundColor: color}}></div>
                <div className="name">{name}</div>
              
           
        </div>
}


export const Dropdown = ({ placeholder="New", name, options = [], onChange, defalutValue="", DropdownItemRender=DropdownItem, addMore=false, hasAddMoreMeta=false, morePlaceholder="",  metaPlaceholder="", AddMoreRenderer=AddMoreTextItem, onAddMore }) => {

    const [ state, setState ] = useState({name: defalutValue || `Choose ${name}`, value: -1});
    const [ toggle, setToggle ] = useState(false);

    const dropdownToggle = () => {
        setToggle(prev => {
            return !prev;
        });
    }

    const updateState = (value) => {
        setState(value);
        dropdownToggle();
        onChange({name, value})
    }

    return <div tabIndex={0} className="dropdown">
            <div className="dropdowninput" onClick={dropdownToggle}>
                <div className="value">{state.name || placeholder}</div>
                <div className="icon">
                    { !toggle ? <FaCaretDown /> : <FaCaretUp />} 
                </div>
            </div>
             { toggle && <ul className="options">
                { addMore && <li key="addmore"><AddMoreRenderer onClick={onAddMore} hasShort={hasAddMoreMeta} placeholder={name} morePlaceholder={morePlaceholder} metaPlaceholder={metaPlaceholder} /></li>}
                { options.map((item) => <li key={item.key}><DropdownItemRender {...item} onClick={updateState} /></li>)}
               
            </ul>
            } 
    </div>

}

export const Textarea = ({ name, placeholder, onChange}) => {
    return <textarea name={name} onChange={({target}) => onChange(target)} placeholder={placeholder} className="textarea">

    </textarea>
}


export const ImageDrop = ({ name, onChange = () => {}, onUpload, reset}) => {
    const [files, setFiles]  = useState([]);
    const [ showUpload, setShowUpload ] = useState(true);

    useEffect(() => {
        setFiles([])
    }, [reset])

    useEffect(() => {
            const FILES = files.map(file => new File([file], file.name));
           files.length > 0 && onChange({name, value: FILES})
    }, [files])

    const handleUpload = () => {
        const req = post('/api/upload');
        files.filter(file => !file.uploaded).forEach(({file}) => req.attach(file.name, file))
        req.then(({body}) => {
         setFiles(prev => prev.map(file => ({...file, uploaded: true})))
         setShowUpload(false);
         onUpload({name, value: body.files});
       })
    }

    const { getRootProps, getInputProps, isDragAccept, isFocused, isDragReject,} = useDropzone({
         multiple: true,
         accept: 'image/*',
          onDrop: acceptedFiles => {
            setFiles((prev) =>  [ ...prev, ...acceptedFiles.map(file => ({ file, uploaded: false,
              preview: URL.createObjectURL(file)})
            )]);
            setShowUpload(true);
          } 
    });

    const removeFile = (name) => {
            setFiles(prev => {
                return prev.filter(({file}) => file.name!=name)
            })
    }

    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
      }, []);

      const thumbs = useMemo(() => files.map(({file, uploaded, preview}, i) => (
        <div className="name" key={file.name+ i}>
        { showUpload && !uploaded && <div className="remove" onClick={() => removeFile(file.name)}>
           <FaMinusCircle/>
        </div> }
        <div className="inner">
            <img
            src={preview}        
            />
        
        </div>
        </div>
      )), [files]);


  return (
    <section className="imagedrop">
      <div {...getRootProps({className: 'dropzone', isDragAccept, isFocused, isDragReject})}>
        <input {...getInputProps()} />
        <FaArrowCircleDown size={"2em"}/> 
        <p> Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside className="preview">
        {thumbs.length > 0 ? thumbs : "Preview Pane"}
        
      </aside>
      { files.length !=0 && showUpload && <div className="upload">
            <Button onClick={handleUpload} size="small" color="primary" label={"Upload"}/>
        </div>}
    </section>
  );
}

export const CheckBox = ({ name, onChange = () => {}, value, label, checked=false}) => {
    const [state, setState] = useState(checked);

    const handleCheck = () => {
        setState(prev => { return !prev} );
        onChange({name, value, checked: !state});
    }

    return <div tabIndex={0} className="checkbox" onClick={handleCheck}>
        <div className="box">
         { state && <FaCheck />}
        </div>
        <div className="label">
                {label}
        </div>
    </div>
}

export const Button = ({  name, Icon=FaDownload, type="button", label, color="primary", size="medium", onClick}) => {
    return <button tabIndex={0} name={name} type={type} onClick={onClick} className={`button big ${color} ${size}`}>
           <div className="icon">
              <Icon />
            </div> {label}
    </button>
}






