import React, { useMemo, useState,useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import axios from 'axios'
import { apiURL } from './apiURL'
import CircularProgress from '@material-ui/core/CircularProgress'
import DeleteIcon from '@material-ui/icons/Delete'
import { IconButton } from '@material-ui/core'
import swal from 'sweetalert'

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '30px',
    borderWidth: 3,
    borderRadius: 3,
    fontSize: '18px',
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#a2a2a2',
    outline: 'none',
    transition: 'border .24s ease-in-out'
};


const thumb = {
    display:'inline-flex',
    borderRadius:2,
    border:'1px solid #eaeaea',
    marginBottom:8,
    marginRight:8,
    width:100,
    height:100,
    padding:4,
    boxSizing:'border-box'
};
const thumbInner = {
    display:'flex',
    minWidth:0,
    overFlow:'hidden'
};
const img ={
    display:'black',
    width:'auro',
    height:'100%',
};

  
const activeStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

let allFiles = [];

function DragAndDrop() {
    const setDefaultTypes = () => {
        return [
            {checked: false, type: '.jpg'},
            {checked: false, type: '.jpeg'},
            {checked: false, type: '.png'},
            {checked: false, type: '.pdf'},
            {checked: false, type: '.gif'},
            {checked: false, type: '.svg'},
            {checked: false, type: '.mp4'},
            {checked: false, type: '.mp3'},
            {checked: false, type: '.doc'},
            {checked: false, type: '.docx'},
        ];
    }
    const [fileTypes, setFileTypes] = useState(setDefaultTypes);
    const [draggedFiles, setDraggedFiles] = useState([]);
    const [progress, setProgress] = useState(false);
    const {
        getRootProps,
        getInputProps,
        open,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        accept: fileTypes.filter(type => type.checked).length ? fileTypes.filter(type => type.checked).map(type => {return type.type}) : '', 
        noClick: true, 
        noKeyboard: true,
        onDrop: (acceptedFiles) => {
            setDraggedFiles(acceptedFiles.map(file => {
                allFiles.push(file);
                allFiles = allFiles.filter((value, index, arr) => arr.findIndex(item => (item.name === value.name)) === index);
                console.log(allFiles);
                Object.assign(file, {
                    preview: URL.createObjectURL(file)
                })
            }));
        },
        onDropRejected: (fileRejections) => {
            if(fileRejections.length) {
                swal('Some files can not be accepted', {
                    icon: 'warning',
                    closeOnClickOutside: false,
                    closeOnEsc: false,
                }).then(function() {
                    open();
                });
            }
        }
    });

    const cancelFileToUpload = (file) => {
        allFiles.splice(allFiles.indexOf(file), 1);
        setDraggedFiles([...allFiles]);
    }

    let files = allFiles.map(file => 
        <li key={file.path}>
            {file.path} - {file.type} - {file.size} bytes
            <IconButton color="secondary" aria-label="delete" onClick={() => cancelFileToUpload(file)}>
                <DeleteIcon />
            </IconButton>
        </li>
    );
    
    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isDragActive,
        isDragReject,
        isDragAccept
    ]);
    
    const getFileTypes = (checked, id) => {
        let arr = fileTypes;
        arr[id].checked = checked;
        setFileTypes([...arr]);
    }

    const uploadFiles = () => {
        if(navigator.onLine) {
            setProgress(true);
            let formData = new FormData();
            allFiles.forEach(file => {
                formData.append('files', file);
            })
            axios.post(apiURL + '/upload', formData)
            .then(res => {
                console.log(res);
                if(res['data'].status === 200) {
                    setProgress(false);
                    swal(res['data'].msg, {
                        icon: 'success',
                        closeOnClickOutside: false,
                        closeOnEsc: false
                    });
                }
                if(res['data'].status === 201) {
                    setProgress(false);
                    swal(res['data'].msg, {
                        icon: 'warning',
                        closeOnClickOutside: false,
                        closeOnEsc: false
                    });
                }
            })
            .catch(err => {
                setProgress(false);
                swal('Something went wrong', {
                    icon: 'error',
                    closeOnClickOutside: false,
                    closeOnEsc: false
                });
                console.log(err);
            })
        } else {
            swal('No internet connection', {
                icon: 'warning',
                closeOnClickOutside: false,
                closeOnEsc: false
            });
        }
    }

    const resetFilters = () => {
        setFileTypes(setDefaultTypes);
        console.log(fileTypes);
    }

    const selectAllFilters = (checked) => {
        console.log(checked);
        let arr = fileTypes;
        arr.forEach(item => {
            item.checked = checked;
            setFileTypes([...arr]);
        });
    }
    const thumbs = allFiles.map(file=>(
        <div style={thumb} key={file.name}>
           {/* <a target="_blank" href={file.preview}> */}
           <div style={thumbInner}>
            <img
            src={file.preview}
            alt={file.name}
            style={img}
            />
            </div>
            {/* </a> */}
        </div>
    ));

    useEffect(()=>()=>{
        files.forEach(file=>URL.revokeObjectURL(file.preview));  
    },[files]);

    return (
        <div className="container">
            <div {...getRootProps({style})}>
                <input {...getInputProps()} />
                <p>Drag and drop some files here...</p>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => open()}
                >
                    Choose
                </Button>
            </div>
            <FormGroup row>
                <FormControlLabel
                    control={
                        <Checkbox
                            color="secondary"
                            onChange={(event) => selectAllFilters(event.target.checked)}
                        />
                    }
                    label="Select all"
                />
                {fileTypes.map((type, index) => {
                    return(
                        <FormControlLabel key = {index}
                            control={
                                <Checkbox
                                    checked={type.checked}
                                    color="secondary"
                                    onChange={(evt) => getFileTypes(evt.target.checked, index)}
                                    value={type.type}
                                />
                            }
                            label={type.type}
                        />
                    )
                })}
                <Button 
                    variant="contained" 
                    color="secondary"
                    style={{marginLeft: 'auto'}} 
                    onClick={() => resetFilters()}
                >
                    Reset
                </Button>
            </FormGroup>
            <ul style={{listStyle: 'none'}}>{files}</ul>
            {progress ? <CircularProgress variant="indeterminate"/> : null}
             <aside>{thumbs}</aside>
            <Button 
                onClick={() => uploadFiles()} 
                variant="contained" 
                color="secondary" 
                disabled={allFiles.length === 0} 
                endIcon={<CloudUploadIcon />}
            >
                Upload
            </Button>
        </div>
    );
}

export default DragAndDrop