import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { DropzoneArea } from 'material-ui-dropzone';
import './Tomato.css';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import clsx from 'clsx';

const TomatoChoose = () => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [success, setSuccess] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [openRight, setOpenRight] = useState(false);
  const [images, setImages] = useState([]);
  const [layers, setLayers] = useState([]);
  const [layerSelected, setLayerSelected] = useState(0);
  const [imageFilters, setImageFilters] = useState('');
  const [fileClicked, setFileClicked] = useState(null);
  const classes = useStyles();

  useEffect(() => {
    axios.get('http://45.137.148.253:8000/api/layers_count/').then(res => {
      let numArray = res.data;
      let arr = [];
      for (let i = 0; i < numArray; i++) {
        arr.push({
          number: i
        });
      }
      setLayers(arr);
    });
  }, []);

  const buttonClassname = clsx({
    [classes.buttonSuccess]: success
  });

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = files => {
    console.log(files);
    setFiles(files);
  };

  const handleOpen = () => {
    setOpen(true);
    setLoading(false);
    setSuccess(false);
  };

  const handleModalClosePrediction = () => {
    if (files) {
      setLoading(true);
      setImages([]);
      setImageFilters([]);
      let formData = new FormData();
      files.forEach(file => formData.append('image', file));
      axios
        .post('http://45.137.148.253:8000/api/tomato_predict_all/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(response => {
          setLoading(false);
          setSuccess(true);
          setOpen(false);
          let imgs = [];
          files.forEach(file => {
            let fr = new FileReader();
            fr.onload = () => {
              imgs.push({
                src: fr.result,
                opacity: 1
              });
              if (imgs.length === response.data.length) {
                setImages(imgs);
              }
            };
            fr.readAsDataURL(file);
          });
          setPredictions(response.data);
        });
    }
  };

  const handleFilter = (e, file, index) => {
    setOpenRight(true);
    setFileClicked(file);
    setLayerSelected(0);
    setLoadingFilters(true);
    setImages([
      ...images.map((im, ind) => ({
        src: im.src,
        opacity: ind === index ? 1 : 0.3
      }))
    ]);
    let formData = new FormData();
    formData.append('image', file);
    formData.append('layer', 0);
    setImageFilters([]);
    // fetch('http://45.137.148.253:8000/api/tomato_filters/', {
    //   method: 'POST',
    //   body: formData
    // }).then(res => {
    //   setImageFilter(`data:image/jpeg;base64, ${res.json()}`);
    // });
    //   .then(response => response.blob())
    //   .then(blob => {
    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //       setImageFilter(reader.result);
    //     };
    //     reader.readAsDataURL(blob);
    //   });
    axios
      .post('http://45.137.148.253:8000/api/tomato_filters/', formData)
      .then(res => {
        // console.log(res);
        // var reader = new FileReader();
        // reader.onloadend = function() {
        //   setImageFilter(reader.result);
        // };
        // reader.readAsDataURL(res);
        setLoadingFilters(false);

        setImageFilters(res.data.map(i => `data:image/jpeg;base64, ${i}`));
      });
  };

  const handleLayerChange = event => {
    setLayerSelected(event.target.value);
    setImageFilters([]);
    setLoadingFilters(true);
    let formData = new FormData();
    formData.append('image', fileClicked);
    formData.append('layer', event.target.value);
    axios
      .post('http://45.137.148.253:8000/api/tomato_filters/', formData)
      .then(res => {
        // console.log(res);
        // var reader = new FileReader();
        // reader.onloadend = function() {
        //   setImageFilter(reader.result);
        // };
        // reader.readAsDataURL(res);
        setLoadingFilters(false);

        setImageFilters(res.data.map(i => `data:image/jpeg;base64, ${i}`));
      });
  };

  const handleRightClose = () => {
    setOpenRight(false);
    setImageFilters([]);
    let newims = images.map((im, ind) => ({
      src: im.src,
      opacity: 1
    }));
    console.log(newims);
    setImages([...newims]);
  };

  return (
    <div>
      <div className="p-4 d-flex align-items-left">
        <Button onClick={handleOpen} variant="contained" color="primary">
          Upload images for prediction
        </Button>
      </div>

      <div className="mt-5">
        <div className="container-fluid px-4">
          <div className="row">
            <div
              className={`${
                openRight ? 'col-9' : 'col-12'
              } pr-4 left-images-shown`}
              style={{
                borderRight: openRight ? '2px solid #d1d1d1' : '',
                height: '87vh',
                overflow: 'auto'
              }}
            >
              {(files &&
                predictions &&
                images &&
                predictions.length &&
                images.length && (
                  <div className="container-fluid">
                    <div className="row">
                      {images.map((image, index) => (
                        <div className="col-3 p-2">
                          <div
                            className="container-fluid align-items-center d-flex"
                            style={{
                              cursor: 'pointer',
                              opacity: image.opacity,
                              height: '100%',
                              border: '1px solid #efefef',
                              borderLeft:
                                predictions[index][0] > predictions[index][1]
                                  ? '4px solid green'
                                  : '4px solid red'
                            }}
                            onClick={e => handleFilter(e, files[index], index)}
                          >
                            <div className="row align-items-center">
                              <div className="col-7">
                                <img
                                  src={image.src}
                                  alt="slika"
                                  style={{ width: '100%' }}
                                />
                              </div>
                              <div className="col-5 pl-2 text-left">
                                {(predictions[index][0] >
                                  predictions[index][1] && (
                                  <div>
                                    <span style={{ color: 'green' }}>
                                      <strong>Healthy</strong>
                                    </span>
                                    <div
                                      style={{
                                        fontSize: '11px',
                                        color: '#5e5e5e'
                                      }}
                                    >
                                      <span>
                                        with{' '}
                                        <span
                                          className="font-weight-bold"
                                          style={{ fontSize: '14px' }}
                                        >
                                          {Number(
                                            +predictions[index][0] * 100
                                          ).toFixed(2)}
                                          %
                                        </span>{' '}
                                        accuracy
                                      </span>
                                    </div>
                                  </div>
                                )) || (
                                  <div>
                                    <span style={{ color: 'red' }}>
                                      <strong>Unhealthy</strong>
                                    </span>
                                    <div
                                      style={{
                                        fontSize: '11px',
                                        color: '#5e5e5e'
                                      }}
                                    >
                                      <span>
                                        with{' '}
                                        <span
                                          className="font-weight-bold"
                                          style={{ fontSize: '14px' }}
                                        >
                                          {Number(
                                            +predictions[index][1] * 100
                                          ).toFixed(2)}
                                          %
                                        </span>{' '}
                                        accuracy
                                      </span>
                                    </div>
                                  </div>
                                )}
                                <div></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )) || <span></span>}
            </div>
            {(openRight && predictions.length && (
              <div className={`${openRight ? 'col-3' : ''}`}>
                <div className="text-left" style={{ fontSize: '16px' }}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>
                        <span>Feature maps</span>
                      </strong>
                    </div>
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={handleRightClose}
                    >
                      x
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-start py-3">
                  <Select value={layerSelected} onChange={handleLayerChange}>
                    {layers.map(layer => (
                      <MenuItem
                        value={layer.number}
                      >{`Layer ${layer.number}`}</MenuItem>
                    ))}
                  </Select>
                </div>
                {loadingFilters && (
                  <div>
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  </div>
                )}
                <div className="w-100">
                  {imageFilters && (
                    <div
                      className="w-100"
                      style={{ overflow: 'auto', height: '80vh' }}
                    >
                      {imageFilters.map(imageFilter => (
                        <div className="py-3 w-100">
                          <img
                            src={imageFilter}
                            style={{
                              width: '60%',
                              border: '1px solid #b3b3b3'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )) || <span></span>}
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        className="d-flex align-items-center justify-content-center modal-wrapper"
      >
        <div
          className="d-flex align-items-center w-100 flex-column pt-4 dropzone-area-wrapper"
          style={{
            backgroundColor: 'white'
          }}
        >
          <DropzoneArea
            onChange={handleChange}
            filesLimit={1000}
            acceptedFiles={['image/*']}
            showAlerts={false}
            className={classes.area}
            style={{ overflow: 'auto' }}
          />
          <div className="mt-4 pb-4">
            <Button
              onClick={handleModalClosePrediction}
              disabled={loading}
              className={buttonClassname}
              variant="contained"
              color="primary"
            >
              PREDICT
              {loading && (
                <CircularProgress
                  size={24}
                  className={classes.buttonProgress}
                />
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center'
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative'
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700]
    }
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1
  },
  area: {
    overflow: 'auto'
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

export default TomatoChoose;
