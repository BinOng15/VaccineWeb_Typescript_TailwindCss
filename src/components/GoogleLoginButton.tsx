/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { notification, Modal, Spin } from "antd";
// import { googleSignUpApi, googleSigInpApi } from "../util/api"; // Make sure the path is correct
//import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

const GoogleLoginButton: React.FC = () => {
  //const navigate = useNavigate(); // Initialize useNavigate hook
  const [loading, setLoading] = useState(false); // State to manage modal visibility
  const handleSuccess = async (response: any) => {
    const googleId = response.credential;
    localStorage.setItem("googleId", googleId);

    setLoading(true);

    // try {
    //   // Try to log in the user first
    //   const loginResponse = await googleSigInpApi(googleId);

    //   // Assuming the API response contains a token
    //   const token = loginResponse.token;
    //   if (token) {
    //     // Store token in localStorage
    //     localStorage.setItem("token", token);
    //   }

    //   notification.success({
    //     message: "Google Login Successful",
    //     description: "You have successfully logged in with Google.",
    //   });

    //   navigate("/");
    // } catch (error: any) {
    //   if (
    //     error.response &&
    //     error.response.data.message === "Email not verified!."
    //   ) {
    //     setLoading(false); // Hide modal if specific error occurs
    //     return;
    //   }

    //   try {
    //     // If login fails and the error is not about unverified email, try to sign up the user
    //     const signupResponse = await googleSignUpApi(googleId);
    //     console.log("Signup API Response:", signupResponse);

    //     // Assuming the signup response also contains a token
    //     const token = signupResponse?.data?.token;
    //     if (token) {
    //       // Store token in localStorage
    //       localStorage.setItem("token", token);
    //     }
    //     navigate("/signup-email");
    //   } catch (signupError) {
    //     console.error("Signup failed:", signupError);
    //     notification.error({
    //       message: "Google Signup Failed",
    //       description: "An error occurred while signing up with Google.",
    //     });
    //   }
    // } finally {
    //   // Hide the modal when all API calls are complete
    //   setLoading(false);
    // }
  };

  const handleError = () => {
    notification.error({
      message: "Google Login Failed",
      description: "An error occurred while logging in with Google.",
    });
  };

  return (
    <>
      <GoogleOAuthProvider clientId="976712067094-lv2i7i7ln5kul1tjejpti6a85rm3unt7.apps.googleusercontent.com">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
        />
      </GoogleOAuthProvider>

      {/* Loading Modal */}
      <Modal
        visible={loading}
        footer={null}
        closable={false}
        centered
        bodyStyle={{ textAlign: "center" }}
      >
        <Spin size="large" />
        <p>Logging in, please wait...</p>
      </Modal>
    </>
  );
};

export default GoogleLoginButton;
