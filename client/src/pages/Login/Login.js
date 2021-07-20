import React from 'react';
import './Login.css';
import { Button } from 'reactstrap';

const Login = () => {
  return (
    <div className="center">
        <div className="align-flex">
          <img 
            className='riceimage' 
            src={process.env.PUBLIC_URL + '/logo-blue.png'} 
            alt="rice logo"
          />
          <div className="title-name">Rice Bowl</div>
        </div><br/>
        <a href="https://localhost:9000/auth/google">
          <b><Button className="btn" outline color="primary">Log In using Google
            </Button></b></a>
    </div>
  );
};

export default Login;
