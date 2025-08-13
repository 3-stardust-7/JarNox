import { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
import StockDashboard from "../components/StockDashboard";

const Home = () => {
    const [response, setResponse] = useState("");
    
      const fetchPing = () => {
        fetch("http://127.0.0.1:8000/ping")
          .then(res => res.json())
          .then(data => setResponse(data.message))
          .catch(err => console.error("Error:", err));
      };
    
      useEffect(() => {
        fetchPing(); // run immediately
        const interval = setInterval(fetchPing, 60_000); // run every 1 min
    
        return () => clearInterval(interval);
      }, []);
  return (
        <div className="min-h-screen bg-blue-900 text-white">
      {/* Navbar at top */}
      <Navbar />
      <StockDashboard/>

      {/* Centered content */}
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <h1 className="text-3xl font-bold">
          Backend says: {response}
        </h1>
      </div>
    </div>
  )
}

export default Home