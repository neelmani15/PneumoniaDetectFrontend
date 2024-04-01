import React,{useState} from 'react';
import loadingGif from '../Images/loading.gif';
// const { GoogleAuth } = require('google-auth-library');

export default function UploadImage() {
  const [image, setImage] = useState(null);
  const [loading,setLoading]=useState(false);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    console.log("Submitted");
    e.preventDefault();
    if (!image) {
      console.log("No image selected");
      return;
    }
    setLoading(true);
    setPredictions([]);
    setError('');

    try {
      const base64Image = await convertToBase64(image);
      const requestBody = {
        instances: [{ content: base64Image }],
        parameters: {
          confidenceThreshold: 0.5,
          maxPredictions: 5
        },
      };
      const response= await fetch('https://us-central1-aiplatform.googleapis.com/v1/projects/800942329474/locations/us-central1/endpoints/3582747643991818240:predict',{
          method:'POST',
          headers:{
            'Authorization':'Bearer ya29.a0Ad52N39iOX1vsNtgSogAOQRSjpk4OkyfxEzCchHhQdPS-fvyW7SC4g2d0Y74zVekV4GU76-4kbyMo3VvIy2qA8tjHjKu8IhBZl7VPbfhxHDXi5UCeyjutxN3GUPbKXwuEfD-PkpjGn4ARKr7vZplY9rTs8YmzXc4C9yeSWxCllYaCgYKAa8SARASFQHGX2Mib52UEJ1uWlU78QRobO9eVw0178',
            'Content-Type':'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      const data = await response.json();
      console.log(data);
      setPredictions(data.predictions || []);
      // console.log(data.error.details[0].reason);
      if (data.error) {
        setError(data.error.details[0].reason);
        // setError('Unable to predict image right now try again after some time');
      } else {
        setError('');
      }
    }catch(e){
      console.log(e);
    }finally{
      setLoading(false);
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      {loading && (
        <div className="absolute inset-0 bg-gray-300 opacity-50 flex items-center justify-center z-500">
          <img src={loadingGif} alt="Loading..." />
        </div>
      )}
      <h2 className="text-5xl font-bold mb-4">Pneumonia Detection</h2>
      <p className="text-xl mb-4" >Upload the X-Ray image to detect Pneumonia or Normal</p>
      <div className="bg-blue-100 p-8 rounded-xl shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Upload Image</h1>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-4">
            <label htmlFor="image" className="block text-gray-700 font-bold mb-2">Choose Image:</label>
            <input type="file" id="image" name="image" className="block w-full py-2 px-3  border border-gray-300 rounded focus:outline-none focus:border-indigo-500" onChange={handleImageChange} />
          </div>
          <div className="flex justify-end">
            {/* <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Submit</button> */}
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">{loading ? 'Loading...' : 'Submit'}</button>
          </div>
        </form>
      </div>

      {predictions.length > 0 && (
        <div className="mt-8 max-w-md w-full">
        {predictions.map((prediction, index) => (
            <div key={index} className={`bg-${prediction.displayNames[0] === 'Pneumonia' ? 'yellow' : prediction.displayNames[0] === 'Normal' ? 'green' : 'red'}-200 p-4 rounded-xl shadow-md max-w-md w-full`}>
              <h1 className="text-2xl font-bold mb-3">Prediction Result</h1>
              <p>Result: {prediction.displayNames[0]}</p>
              <p>Accuracy: {prediction.confidences[0]}</p>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="bg-red-100 p-4 rounded shadow-md max-w-md w-full mt-4">
          <p className="text-red-600 font-bold text-lg mb-2">{error}</p>
          <p className="text-red-600 text-sm mb-2">Unable to predict image right now try again after some time</p>
        </div>
      )}
    </div>
  )
}
