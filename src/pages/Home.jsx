import { useEffect, useState } from "react";
import CompanySelector from "../components/CompanySelector";
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
     <div className=" bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto 2xl:mx-140 px-4 py-8 w-full">
          {/* Company Selector at the top */}
          <div>
            <CompanySelector />
          </div>
          
          {/* Stock Dashboard below */}
          <div className="w-full">
            <StockDashboard />
          </div>
        </div>
      </div>
  )
}

export default Home