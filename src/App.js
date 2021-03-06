// 0. Install fingerpose npm install fingerpose
// 1. Add Use State
// 2. Import emojis and finger pose import * as fp from "fingerpose";
// 3. Setup hook and emoji object
// 4. Update detect function for gesture handling
// 5. Add emoji display to the screen


import React, { useRef, useState, useEffect } from "react";
// import logo from './logo.svg';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utilities";
import * as fp from "fingerpose";
import victory from "./victory.png";
import thumbs_up from "./thumbs_up.png";
import hand_raise from "./Raised Hand Emoji.png"


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  //NEW STUFF ADDED STATE HOOK
  const [emoji, setEmoji] = useState(null);
  const images = { thumbs_up: thumbs_up, victory: victory, hand_raise: hand_raise };
  //NEW STUFF ADDED STATE HOOK

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);
      // console.log(hand);

      //First we are checking whether we are detecting a hand
      //in the video by giving the condition before

      if (hand.length > 0) {
        //Seeting up a new gesture estimator for the
        //fingerpose model imported above
        const GE = new fp.GestureEstimator([
          //here we are using up two gesture
          //victory gesture and thumbsup
          //Here we can add we gestures of our choice 
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
          // fp.Gestures.RaisedHandGesture,
        ]);
        //declared a constant as gesture and
        //it is asychronus hence using await
        //Grabbing thr ge declared above and then 
        //passing thorugh handpose prediction
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        //checking if we got a gesture and 
        //is not undefined and greater than zero
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          // console.log(gesture.gestures);

          //map the gesture there and traversing
          //through the object and map
          const confidence = gesture.gestures.map(
            //get the prediction confidence
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
            //get the maximun confidence here
            Math.max.apply(null, confidence)
          );
          // console.log(gesture.gestures[maxConfidence].name);
          //then get the confidence of that gesture
          //then we are setting the state here using setEmoji
          setEmoji(gesture.gestures[maxConfidence].name);
          console.log(emoji);
        }
      }

      //NEW STUFF ADDED GESTURE HANDLING

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  useEffect(()=>{runHandpose()},[]);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
        {/* setting the emoji here */}
        {emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 400,
              bottom: 500,
              right: 0,
              textAlign: "center",
              height: 100,
            }}
          />
        ) : (
          ""
        )}
      </header>
    </div>
  );
}

export default App;
