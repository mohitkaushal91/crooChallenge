import React, {useState, useEffect} from "react";
import './App.css';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import io from 'socket.io-client';
import $ from 'jquery';
import toast, { Toaster } from 'react-hot-toast';
var md5 = require('md5');
var dateFormat = require("dateformat");

let socket;
let documentStatus;
function App() {

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [commentList, setCommentList] = useState([])
  const ENDPOINT = 'localhost:3001'; // URL on which Node.js Server is running

  const notify = () => toast('New Comment'); // Notification Content

  // useffect function to get data from APIs
  useEffect(()=>{

    Axios.get('http://localhost:3001/api/get').then((response)=>{
      $.isEmptyObject(response.data)?commentListEmpty(): setCommentList(response.data);
    })

    socket = io(ENDPOINT, {transports: ['websocket']});

    socket.on('message', alertsocket);
    socket.on('message', notify);
    ;
  }, []);

  // function to add content No comments if there are no comments
  const commentListEmpty = () => {
    var noComment = "<div class='row nocomment'><h3 class='text-center'>No Comments</h3><hr></hr></div>";
    $('.commentListDiv').append(noComment);
  }

  // socket function to add new data after trigging socket
  const alertsocket = (val) => {
    // Remove no comment div
    if($(".nocomment")[0]){
      $(".nocomment").remove();
    }

    if(documentStatus === "hidden"){
      if(!($(".displayhistory")[0])){
        var displayHistory = "<div class='displayhistory'><hr/><p class='text-center'><b>History</b></p><hr/></div>";
        $('.commentListDiv').append(displayHistory);
      }
    }

    var hashemail = md5(val.email); // md5 encryption
    var neewData = "<div class='outerDiv'><div class='row topDiv'><div class='d-flex justify-content-between'><div class='name'><img class='img-thumbnail logo' src='https://www.gravatar.com/avatar/"+hashemail+"'} alt='profile' /><a href='mailto:"+val.email+ "'>"+ val.name +"</a></div><div>"+ dateFormat(val.date, "mmmm dS, yyyy") +"</div></div></div><div class='row'><div class='col-md-12 col-xs-12 commentDesc mt-3 mb-4'><p class='p-3'>"+ val.comment + "</p></div></div></div>";
    $('.commentListDiv').append(neewData);
  }

  // submit comment function
  const submitComment = (event) => {
    event.preventDefault();
    event.stopPropagation();
    Axios.post('http://localhost:3001/api/insert', {
      name: name,
      email: email,
      comment: comment
    }).then(()=>{
      console.log("succesfull insertion");
    })
    event.target.reset();
  };

  // check when window is scrolled to the bottom
  window.onscroll = function() {
    var d = document.documentElement;
    var offset = d.scrollTop + window.innerHeight;
    var height = d.offsetHeight;

    if (offset+250 >= height) {
      if(documentStatus === "shown" && ($(".displayhistory")[0])){
        $(".displayhistory").remove();
      }
    }
  };

  // addeventlistener to check if tab is visible
  document.addEventListener("visibilitychange", function() {
    documentStatus = document.hidden?"hidden":"shown";
});

  return (
    <div className="App">
      {/* comment section starts */}
      <div className={'container mt-3'}>
          <h1>Comments</h1>
        <hr></hr>
    
      <div className={'commentListDiv'}>
        {/* map throught comment list and return HTML */}
        {commentList.map((val)=>{

          return (<div className={'outerDiv'}><div className={'row topDiv'}>
          <div className={'d-flex justify-content-between'}>
            <div className="name">
              <img src={`https://www.gravatar.com/avatar/${md5(val.email)}`} className={'img-thumbnail logo'} alt="profile" />
              <a href={`mailto:${val.email}`}>{val.name}</a>
            </div>
            <div>
              {dateFormat(val.date, "mmmm dS, yyyy")}
            </div>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col-md-12 col-xs-12 commentDesc mt-3 mb-4'}>
            <p className={'p-3'}>{val.comment}</p>
          </div>
        </div></div>);
       })}
      </div>
      </div>


{/* comment form section starts */}
      <div className={'container mt-4'}>
        <h4 className={'text-center'}>Leave a Comment</h4>
        <form className={'mt-4 mb-5'} onSubmit={submitComment}>
          <div className={'row'}>
            <div className={'col'}>
              <div className={'form-group'}>
              <label className={'form-label'} htmlFor="name">Your Name *</label>
                <input type="text" id="name" onChange={(e)=> {
        setName(e.target.value)
      }} className={'form-control'} placeholder="Your Name" required />
              </div>
            </div>
            <div className={'col'}>
              <div className={'form-group'}>
              <label className={'form-label'} htmlFor="email">Your Email *</label>
                <input type="email" id="email" onChange={(e)=> {
        setEmail(e.target.value)
      }} className={'form-control'} placeholder="Your Email" required />
              </div>
            </div>
          </div>
          <div className={'row mt-3'}>
            <div className={'form-group'}>
              <label className={'form-label'} htmlFor="comment">Your Comment here *</label>
              <textarea className={'form-control'} onChange={(e)=> {
        setComment(e.target.value)
      }} id="comment" rows="5" required></textarea>
            </div>
          </div>
          <button type="submit" className={'btn btn-primary mt-4'}>Submit Comment</button>
          <Toaster /> {/* Toaster for triggering Notifications */}
        </form>
      </div>
    </div>
  );
}

export default App;
