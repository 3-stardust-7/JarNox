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
     <div className=" bg-gradient-to-b from-gray-900  via-indigo-900 to-gray-900">
   <div className="h-auto ">
  <img src="/JarNox.png" alt="JarNox Logo" className=" ml-4 h-20 w-20 sm:ml-20 lg:ml-40 2xl:ml-168" />
</div> 

        <div className="container mx-auto  px-4 py-8 w-full">
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