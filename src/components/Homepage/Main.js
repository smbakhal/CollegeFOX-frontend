import React, { useState, useEffect } from 'react';
import './Main.css';
import DisplayByCategory from './postsDisplay/DisplayByCategory';
import { useSelector } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import PostsList from '../User/PostsList';

function Main() {

  const [categoriesArray, setCategoriesArray] = useState([]);
  const categories = useSelector(state => state.posts.categories);
  const searchValue = useSelector(state => state.search.value);

  // console.log(categories)

  useEffect(() => {
    if (categories === undefined) return;
    gettingCategories();
  }, [categories])

  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
 
  const gettingCategories = () => {
    let filtered = shuffle(categories).filter((val, i) => i < 12);
    console.log(filtered)
    setCategoriesArray(filtered.map((val, i) => (
      <DisplayByCategory category={val} key={i} numItemsToDisplay="8" />
    )))
  }

  return (
    <div className="main-posts-container">
      <Switch>
        <Route exact path="/">{categoriesArray}</Route>
        {/* <Route path="/vehicles"><DisplayByCategory category="Vehicles" numItemsToDisplay="20" /></Route> */}
        <Route path="/real-estate">
          <DisplayByCategory category="Apartments" numItemsToDisplay="20" />
        </Route>
        <Route path="/free-stuff">
          <DisplayByCategory category="Free stuff" numItemsToDisplay="20" />
        </Route>
        <Route path="/computer">
          <DisplayByCategory category="Computer" numItemsToDisplay="20" />
        </Route>
        {/* <Route path="/musical-instruments"><DisplayByCategory category="Musical instruments" numItemsToDisplay="20" /></Route> */}
        {/* <Route path="/games-and-toys"><DisplayByCategory category="Games and toys" numItemsToDisplay="20" /></Route>
        <Route path="/household-supplies"><DisplayByCategory category="Household supplies" numItemsToDisplay="20" /></Route>
        <Route path="/family"><DisplayByCategory category="Family" numItemsToDisplay="20" /></Route>
        <Route path="/pets"><DisplayByCategory category="Pets" numItemsToDisplay="20" /></Route>
        <Route path="/home-decoration-supplies"><DisplayByCategory category="Home decoration supplies" numItemsToDisplay="20" /></Route>
        <Route path="/sports"><DisplayByCategory category="Sports" numItemsToDisplay="20" /></Route>
        <Route path="/fun"><DisplayByCategory category="Fun" numItemsToDisplay="20" /></Route> */}
        <Route path="/search"><DisplayByCategory category={searchValue} numItemsToDisplay="20" /></Route>
        <Route path="/user/my-posts"><PostsList /></Route>
        <Route path="/user/search"><PostsList search={searchValue} /></Route>
        <Route path="/user/bookmarks"><DisplayByCategory bookmarks={true} category="" /></Route>
      </Switch>
    </div>
  )
}

export default Main
