import React, { useState } from "react";
import "./adduser.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const AddUser = () => {
  const users = {
    serviceName: "",
    name: "",
    email: "",
    contactNumber: "",
    date: "",
  };
  const [user, setUser] = useState(users);
  const navigate = useNavigate();

  const inputHandler = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    await axios
      .post("http://localhost:5000/api/user", user)
      .then((response) => {
        toast.success(response.data.message, { position: "top-right" });
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Failed to book event. Please try again.", { position: "top-right" });
      });
  };

  return (
    <div className="wedding-booking-container">
      <div className="booking-header">
        <Link to="/" className="back-button">
          <i className="fa-solid fa-arrow-left"></i> Back
        </Link>
        <h1>Schedule Management</h1>
        <p>Fill in the details below to reserve your special day</p>
      </div>

      <div className="booking-form-container">
        <div className="form-decoration left"></div>
        
        <form className="wedding-booking-form" onSubmit={submitForm}>
          <div className="form-group">
            <div className="input-icon">
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <div className="input-field">
              <label htmlFor="serviceName">Service Type</label>
              <select
                id="serviceName"
                name="serviceName"
                onChange={inputHandler}
                required
              >
                <option value="">Select the Servise </option>
                <option value="Wedding Car">Wedding Car</option>
                <option value="Photographer">Photographer</option>
                <option value="Catering">Catering</option>
                <option value="Wedding Hall">Wedding Hall</option>
                <option value="Dj & Sound System">Dj & Sound System</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon">
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="input-field">
              <label htmlFor="name">Vndor's Name</label>
              <input
                type="text"
                id="name"
                onChange={inputHandler}
                name="name"
                autoComplete="off"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon">
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="input-field">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                onChange={inputHandler}
                name="email"
                autoComplete="off"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon">
              <i className="fa-solid fa-phone"></i>
            </div>
            <div className="input-field">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="tel"
                id="contactNumber"
                onChange={inputHandler}
                name="contactNumber"
                autoComplete="off"
                placeholder="Enter your contact number"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon">
              <i className="fa-solid fa-calendar-alt"></i>
            </div>
            <div className="input-field">
              <label htmlFor="date">Wedding Date</label>
              <input
                type="date"
                id="date"
                onChange={inputHandler}
                name="date"
                autoComplete="off"
                required
              />
            </div>
            
          </div>
          

          <div className="form-actions">
            <button type="submit" className="book-now-button">
            Submit
            </button>
          </div>
        </form>
        
        <div className="form-decoration right"></div>
      </div>
      
      <div className="booking-footer">
        <p>Your perfect day is just a booking away</p>
      </div>
    </div>
  );
};

export default AddUser;
