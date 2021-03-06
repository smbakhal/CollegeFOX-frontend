import React, { useState, useEffect } from 'react';
import './DisplayByCategory.css';
import { useSelector } from 'react-redux';
import Post from './Post';

function DisplayByCategory({ bookmarks, category, numItemsToDisplay }) {

  const posts = useSelector(state => state.posts.postsList);
  const searchValue = useSelector(state => state.search.value);
  const bookmarksData = useSelector(state => state.currentUser.user.bookmarks);
  const [post, setPost] = useState([]);
  const numberOfItems = numItemsToDisplay;
  // console.log(numItemsToDisplay)

  useEffect(() => {
    if (posts === {}) return;
    let filteredPosts;
    if (bookmarks) {
      filteredPosts = Object.values(posts).reduce((acc, val) => acc.concat(val.filter(val => {
        for (let i = 0; i < bookmarksData.length; i++) {
          if (val._id === bookmarksData[i]) return val;
        }
        return false;
      })), [])
    } else {
      let gettingCategory = category.split(' ').map((val, index) => {
        if (index === 0) {
          return val.toLowerCase();
        }
        // console.log(val,index)
        let str;
        // console.log(val)
        for (var i = 0; i < val.length; i++) {
          if (i === 0) {
            str = val[i].toUpperCase();
          } else {
            str += val[i].toLowerCase();
          }
        }
        return str;
      }).join('');


      // console.log("post categories = ",posts[gettingCategory])


      if (posts[gettingCategory] !== undefined) {
        console.log("posts",posts[gettingCategory])
        setPost(posts[gettingCategory].filter((val, i) => i < numberOfItems).map((val) => (
          <Post data={val} key={val._id} />
        )));
        return;
      }
      filteredPosts = Object.values(posts).reduce((acc, val) => acc.concat(val.filter(val => val.title.toLowerCase().includes(searchValue.toLowerCase()))), []);
    }
    setPost(filteredPosts.map(val => (
      <Post data={val} key={val._id} />
    )))
  }, [posts, numberOfItems, category, bookmarksData])

  return (
    <div>
      <h4 className="category-title">{category || ""}</h4>
      <div className="posts-layout">
        {post}
      </div>
      <hr className="category-divider"></hr>
    </div>
  )
}

export default DisplayByCategory
