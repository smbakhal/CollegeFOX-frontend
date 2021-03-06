import React, { useState, useEffect } from 'react';
import './PostForm.css';
import ClearIcon from '@material-ui/icons/Clear';
import AddToPhotosIcon from '@material-ui/icons/AddToPhotos';
import { useSelector, useDispatch } from 'react-redux';
import { TextareaAutosize } from '@material-ui/core';
import { CHANGING_POSTS_FORM, ADD_POST, REMOVE_POST } from '../../store/actionTypes';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

function PostForm({ update, data }) {

  const [img, setImg] = useState('');
  const [categoriesEl, setCategoriesEl] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState('button-disabled');
  const [errForm, setErrForm] = useState({ title: { message: '', outline: '' }, price: { message: '', outline: '' }, description: { message: '', outline: '' } })
  const categories = useSelector(state => state.posts.categories);
  const formData = useSelector(state => state.posts.postForm);
  const postsList = useSelector(state => state.posts.postsList);
  const currentUser = useSelector(state => state.currentUser)
  const dispatch = useDispatch();
  const [submited, setSubmited] = useState(false);

  useEffect(() => {
    if (!update) return
    dispatch({ type: CHANGING_POSTS_FORM, formData: data });
    setButtonDisabled('');
  }, [data])

  useEffect(() => {
    setCategoriesEl(categories.map((val, i) => (
      <option key={i}>{val}</option>
    )))
    dispatch({ type: CHANGING_POSTS_FORM, formData: { ...formData, category: categories[0] } })
  }, [categories]);

  const changingInput = (e, input) => {
    if (input === 'price') {
      if (isNaN(parseInt(e.target.value[e.target.value.length - 1])) && e.target.value !== '') return;
      setErrForm({ ...errForm, price: { message: 'Price cannot be grader then 999 999 999', outline: 'is-invalid' } })
      if (e.target.value > 999999999) return
    }
    if (input === 'title') {
      if (e.target.value.length > 50) {
        setErrForm({ ...errForm, title: { message: 'Title can not be longer then 50 caracters', outline: 'is-invalid' } })
        return
      }
    }
    if (input === 'description') {
      if (e.target.value.length > 6000) {
        setErrForm({ ...errForm, description: { message: 'Description can not be longer then 6000 caracters', outline: 'is-invalid' } })
        return
      }
    }
    setErrForm({ description: { message: 'Descrition is optional', outline: '' }, price: { message: '', outline: '' }, title: { message: '', outline: '' } })
    let modifiedData = {
      ...formData,
      [input]: e.target.value
    }
    dispatch({ type: CHANGING_POSTS_FORM, formData: modifiedData });

    undesableSubmitCheck(modifiedData);
  }

  useEffect(() => {
    setImg(formData.imageUrl.map((val, i) => {
      let url;
      if (val.name === undefined) {
        url = val
      } else {
        url = URL.createObjectURL(val)
      }
      return (<div className="image-preview-sidebar" key={i}>
        <img src={url} alt="IMG" />
        <button type="button" className="remove-photo-button" onClick={e => removePhoto(e, val)}><ClearIcon /></button>
      </div>)
    }))
  }, [formData])

  const undesableSubmitCheck = (formData) => {
    setButtonDisabled('button-disabled');
    if (formData.imageUrl.length < 1) return;
    if (formData.title.length === 0 || formData.title > 100) return;
    if (formData.price.length === 0) return;
    if (formData.description.lenght > 400) return;
    if (formData.location.length === 0) return;

    setButtonDisabled('');
  }

  const addingPhotos = (e) => {
    let formDataModified = { ...formData, imageUrl: [...formData.imageUrl, e.target.files[0]] };
    if (formData.imageUrl.length < 10) {
      dispatch({ type: CHANGING_POSTS_FORM, formData: formDataModified })
    }
    undesableSubmitCheck(formDataModified);
  }

  const removePhoto = async (e, image) => {
    let filteredData;
    if (image.name === undefined) {
      filteredData = formData.imageUrl.filter((val) => val !== image);
    } else {
      filteredData = formData.imageUrl.filter((val) => val.name !== image.name);
    }
    undesableSubmitCheck({ ...formData, imageUrl: filteredData })
    await dispatch({ type: CHANGING_POSTS_FORM, formData: { ...formData, imageUrl: filteredData } })
  }

  const gettingCategory = (cat) => {
    return cat.split(' ').map((val, index) => {
      if (index === 0) {
        return val.toLowerCase();
      }
      let str;
      for (var i = 0; i < val.length; i++) {
        if (i === 0) {
          str = val[i].toUpperCase();
        } else {
          str += val[i].toLowerCase();
        }
      }
      return str;
    }).join('');
  }

  const newPostCallingApi = async (form) => {
    try {
      let post = await axios.post(`/api/users/${currentUser.user.id}/posts/`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${currentUser.user.token}`,
          'enctype': "multipart/form-data"
        }
      })
      console.log(post);
      let category = gettingCategory(formData.category)
       dispatch({ type: ADD_POST, post: { ...postsList, [category]: [...postsList[category], post.data] } });
    } catch (error) {
      console.log(error);
    }
    
  }

  const updatingPost = async (form) => {
    let post = await axios.put(`/api/users/${currentUser.user.id}/posts/${data._id}`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        authorization: `Bearer ${currentUser.user.token}`,
        'enctype': "multipart/form-data"
      }
    })
    let category = gettingCategory(post.data.category[0])
    let categoryPosts = postsList[category].filter(val => val._id !== post.data._id);
    categoryPosts.push(post.data);
    await dispatch({ type: REMOVE_POST, postsList: { ...postsList, [category]: categoryPosts } });
  }

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      if (buttonDisabled !== '') return;

      const form = new FormData();
      formData.imageUrl.forEach(val => {
        if (val.name !== undefined) {
          form.append('imageUrl', val)
        } else {
          form.append('convertedImageUrls', val);
        }
      })
      form.append('title', formData.title);
      form.append('price', formData.price);
      form.append('location', formData.location);
      form.append('category', formData.category);
      form.append('description', formData.description);

      if (!update) {
        newPostCallingApi(form)
      } else {
        updatingPost(form);
      }

      await dispatch({ type: CHANGING_POSTS_FORM, formData: { imageUrl: [], title: '', price: '', category: '', description: '', location: '' } })
      setSubmited(true);
    } catch (err) {
      console.log(err, 'error')
    }
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <form onSubmit={onSubmit} encType="multipart/form-data" action="/upload">
        <div className="form-group ">
          <p className="photo-input-warning">Photos :  {formData.imageUrl.length} / 10 - You cannot add more than 10 photos.</p>
          <div className="photo-input-empty">
            {formData.imageUrl.length === 0 ? (
              <>
                <label htmlFor="photo-input"><div className="photo-input-continer"><div className="add-photo-button-empty"><AddToPhotosIcon style={{ marginRight: '5px' }} />Add New Photo</div></div></label>
                <input type="file" accept=".jpg, .jpeg, .png, .gif, .tiff, .psd, .eps, .ai, .raw, .indd" className="form-control-file file-input" id="photo-input" onChange={addingPhotos} />
                <p className="warning-create-post">* At least 1 photo is required</p>
              </>
            ) : (
                <div className="img-preview-sidebar-container">
                  {img}
                  {formData.imageUrl.length < 10 ? (
                    <div className="image-preview-sidebar">
                      <label className="photo-input-just-button" htmlFor="photo-input"><div className="add-photo-button"><small><AddToPhotosIcon />Add new photo</small></div></label>
                      <input type="file" accept=".jpg, .jpeg, .png, .gif, .tiff, .psd, .eps, .ai, .raw, .indd" className="form-control-file file-input" id="photo-input" onChange={addingPhotos} />
                    </div>
                  ) : null}
                </div>
              )}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="title-input">Title</label>
          <input type="text" className={`form-control ${errForm.title.outline}`} id="title-input" value={formData.title} onChange={e => changingInput(e, 'title')} />
          <p style={{ color: 'red' }} className='warning-create-post'>{errForm.title.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="price-input">Price</label>
          <div style={{ display: 'flex' }}>
            <input type="text" className={`form-control ${errForm.price.outline}`} id="price-input" value={formData.price} onChange={e => changingInput(e, 'price')} />
            <h4 style={{ margin: '2px 0 0 5px', }}>INR</h4>
          </div>
          <p style={{ color: 'red' }} className='warning-create-post'>{errForm.price.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="category-input">Category</label>
          <select placeholder="Choose category" className="form-control" id="category-input" value={formData.category} onChange={e => changingInput(e, 'category')}>
            {categoriesEl}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description-input">Description</label>
          <TextareaAutosize id="description-input" className={`form-control ${errForm.description.outline}`} rowsMin={3} value={formData.description} onChange={e => changingInput(e, 'description')} />
          <p className="warning-create-post">{errForm.description.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="location-input">Location</label>
          <input type="text" className="form-control" id="location-input" value={formData.location} onChange={e => changingInput(e, 'location')} />
        </div>
        <button type="submit" style={{ padding: '5px 35px', margin: '10px 0 20px 0' }} className={`btn btn-primary ${buttonDisabled}`}>{update ? ('Update') : ('Post')}</button>
      </form>
      {submited ? (<Redirect to="/" />) : null}
    </div >
  )
}

export default PostForm;
