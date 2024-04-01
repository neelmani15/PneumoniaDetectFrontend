import React, { useState,useRef } from 'react';
import axios from 'axios'; // Import Axios
import loadingGif from '../Images/loading.gif';

export default function PredictImage() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const api = 'http://localhost:5000/predict';
  const api1 = 'https://pneumonia-detect.vercel.app/predict';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('No image selected');
      return;
    }
    setLoading(true);
    setPredictions([]);
    setError('');

    try {
      const base64Image = await convertToBase64(image);
      const requestBody = {
        imageBase64: base64Image // Rename to match backend's expected key
      };

      // Use Axios instead of fetch
      const response = await axios.post(api, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;
      console.log(data);
      setPredictions(data.predictions || []);
      if (data.error) {
        setError(data.error.details[0].reason);
      } else {
        setError('');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while processing the request.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // If an image already exists, clear it
    if (image) {
      setImage(null);
      // Clear previous predictions and error
      setPredictions([]);
      setError('');
    }
    // Set the new image
    setImage(file);
  };

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   setImage(file);
  // };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageLoad = () => {
    if (predictions.length > 0 && image) {
      const ctx = canvasRef.current.getContext('2d');
  
      const img = new Image();
      img.onload = function () {
        // Clear the canvas
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  
        // Set custom size for the displayed image
        const customWidth = 450; // Set your desired width
        const customHeight = Math.floor((img.height / img.width) * customWidth); // Maintain aspect ratio
        canvasRef.current.width = customWidth;
        canvasRef.current.height = customHeight;
  
        // Draw the new image on the canvas
        ctx.drawImage(img, 0, 0, customWidth, customHeight);
  
        // Draw text on the canvas
        ctx.font = '18px Arial';
        ctx.fillStyle =
          predictions[0].displayNames[0] === 'Normal' ? 'orange' : 'yellow';
        const text = `Pneumonia Chance: ${
          predictions[0].displayNames[0] === 'Normal'
            ? ((1 - predictions[0].confidences[0]) * 100).toFixed(2)
            : (predictions[0].confidences[0] * 100).toFixed(2)
        }%`;
        ctx.fillText(text, 20, 40);
      };
  
      img.src = URL.createObjectURL(image);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-300 opacity-50 flex items-center justify-center z-50">
          <img src={loadingGif} alt="Loading..." />
        </div>
      )}
      <h2 className="text-5xl font-bold mb-4">Pneumonia Detection</h2>
      <p className="text-xl mb-4">Upload the X-Ray image to detect Pneumonia or Normal</p>
      <div className="bg-blue-100 p-8 rounded-xl shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Upload Image</h1>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-4">
            <label htmlFor="image" className="block text-gray-700 font-bold mb-2">Choose Image:</label>
            <input type="file" id="image" name="image" className="block w-full py-2 px-3  border border-gray-300 rounded focus:outline-none focus:border-indigo-500" onChange={handleImageChange} />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">{loading ? 'Loading...' : 'Submit'}</button>
          </div>
        </form>
      </div>

      {/* {predictions.length > 0 && (
        <div className="mt-8 max-w-md w-full">
          {predictions.map((prediction, index) => (
            <div key={index} className={`bg-${prediction.displayNames[0] === 'Pneumonia' ? 'yellow' : prediction.displayNames[0] === 'Normal' ? 'green' : 'red'}-200 p-4 rounded-xl shadow-md max-w-md w-full`}>
              <h1 className="text-2xl font-bold mb-3">Prediction Result</h1>
              <p>Result: {prediction.displayNames[0]}</p>
              <p>Accuracy: {prediction.confidences[0]}</p>
            </div>
          ))}
        </div>
      )} */}
      {error && (
        <div className="bg-red-100 p-4 rounded shadow-md max-w-md w-full mt-4">
          <p className="text-red-600 font-bold text-lg mb-2">{error}</p>
          <p className="text-red-600 text-sm mb-2">Unable to predict image right now, try again after some time</p>
        </div>
      )}

      {predictions.length > 0 && image && (
        <div className="mt-8 max-w-md w-full relative mb-20">
          <div className="flex justify-center items-center mb-10">
            <canvas ref={canvasRef} width={image.width} height={image.height} className='rounded-xl' />
          </div>
          <img src={URL.createObjectURL(image)}  alt="Uploaded" className="rounded-xl shadow-md max-w-md w-full hidden" onLoad={handleImageLoad} />
        </div>
      )}
      {/* {predictions.length > 0 && image && (
        <div className="mt-8 max-w-md w-full relative mb-20">
          <img src={URL.createObjectURL(image)} alt="Uploaded" className="rounded-xl shadow-md max-w-md w-full" />
          {predictions.length > 0 && (
            <div className={`absolute top-1 left-1/2 transform -translate-x-1/2 p-2 rounded-md shadow-md ${predictions[0].displayNames[0] === 'Normal' ? 'bg-green-400' : 'bg-yellow-400'}`}>
              <p>Pneumonia Chance: {predictions[0].displayNames[0] === 'Normal' ? ((1 - predictions[0].confidences[0])*100).toFixed(2) : (predictions[0].confidences[0] * 100).toFixed(2)}%</p>
            </div>
          )}
        </div>
      )} */}
    </div>
  );
}
