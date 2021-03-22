import '../style/App.css';
import tools from '../data/tools.json';
import { colours } from '../lib/constants.js'
import logo from '../assets/hiddentools-logo.png'
import { useState, useEffect } from 'react';
import { Navbar, Footer, Loading } from '../components'
import { countBy } from 'lodash';
import firebase from '../data/firebase'
import { Link } from 'react-router-dom'

const Home = () => {
  // makes a list of just the categories of the tools
  const db = firebase.firestore();
  const [list, setList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const allCategories = list.map( project => project.language )
  const countCategories = countBy(allCategories)
  const [currCategory, setCurrCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [visibleTools, setVisibleTools] = useState(tools)
  const user = firebase.auth().currentUser;

  
  // if searchQuery or currCategory changes, then update visibleTools
  useEffect(() => {
    setVisibleTools(
      filteredTools()
    )
  }, [searchQuery, currCategory])

  // returns an object of tools
  const filteredTools = () => {
    const toolsByCategory = currCategory === "All"
      ? tools // if all
      : tools.filter(tool => tool.category === currCategory) // otherwise apply category

    // query name and description
    const toolsBySearch = toolsByCategory
      .filter(tool => ((tool.name + tool.desc + tool.pricing + tool.category).toLowerCase()).includes(searchQuery.toLowerCase()))
    return toolsBySearch;
  }

  const changeSearch = (event) => {
    setSearchQuery(event.target.value)
  }

  useEffect(() => {
    db.collection("projects")
      .orderBy('date_added')
      .get()
      .then((snapshot) => {
        let projects = [];

        snapshot.forEach((doc) => {
          projects.push({
            id: doc.id, 
            ...doc.data()
          });
        });
        setList(projects);
        setIsLoading(false)
      });
  }, []);



  const Button = ({ category, count }) => {
    return (
      <button
        className={`filter-button ${category === currCategory ? 'filter-active' : ''}`}
        title={category}
        onClick={() => {setCurrCategory(category)}}
      >
          {category} <span className="filter-count"> [{count}]</span>
      </button>
    )
  }

  return (
    <div>
 
     <Navbar />

      <header>
        <div className="header-content">
          <img alt={user ? user.displayName.toLowerCase() + "'s avatar" : 'CodeTribute Logo'} className="logo" src={user ? user.photoURL : logo}/>
          <h1 className="heading">{user ? 'Hey, ' + user.displayName + '! 👋🏻' : 'CodeTribute'}</h1>
          <p className="header-subtitle">{user ? 'Welcome! Browse open-source projects.' : 'Welcome! Become a better developer, help out in the open-source community, and have fun while doing it!'}</p>
          <div className="search-wrapper">
            <input
              className="search" type="text" autoComplete="off" spellCheck="false" placeholder="Search projects..."
              value={searchQuery}
              onChange={changeSearch}
            />
           <div className="filter-wrapper">
            <Button category="All" count={list.length} />
             { Object.keys(countCategories).map(category =>
              <Button category={category} count={countCategories[category]} />
            )}
           
           </div>
          </div>
        </div>
      </header>


      { (visibleTools.length === 0) && (
          <center><span className="no-results">😥 No results found for <strong>{searchQuery}</strong>.</span></center>

      )}

        
      <div className="tools">
        {
          
            isLoading ? 
            <Loading message="repos"/> : 
          list.map((project, index) => (
            
            <Link to={`/${project.owner}/${project.name}`} rel="noreferrer">
            <div className="tool">

            { (project.fork === true) && (
                   <div className="fork-icon" title={`${project.full_name} is a forked repository`}>
                     <svg viewBox="0 0 16 16" version="1.1" width="20" height="20" aria-hidden="true" fill="white">
                       <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
                       </svg></div>
               )}


              <img alt={`${project.owner.toLowerCase()}'s logo`} className="display" src={project.avatar}/>
              <p key={index}><span className="owner">{project.owner}</span>/<span className="name">{project.name}</span></p>
              
              { (project.desc != null) && (
                    <small>{project.desc}</small>
               )}

              { (project.desc === null) && (
                    <small>No description found.</small>
               )}

              <div className="category-wrapper">
              {(project.language in colours) && (
                <button className="language">
                  <svg viewBox="0 0 80 80" width="10" height="10">
                      <circle style={{fill: colours[project.language]}} className="circle" cx="40" cy="40" r="38"/>
                    </svg>
                    &nbsp;
                    {project.language}</button>   
               )}

               {
                 (project.language === null) && (
                  <button className="language">
                    <svg viewBox="0 0 80 80" width="10" height="10">
                      <circle style={{fill: 'white'}} className="circle" cx="40" cy="40" r="38"/>
                    </svg>
                      &nbsp;
                      Unknown</button>   
                 )
               }
 
              <button className="issues">🚨 {project.issues} issues</button>
               <br/>
               <button className="stars">⭐ {project.stars} stars</button>

              </div>
              
            </div>
             </Link>
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default Home;
