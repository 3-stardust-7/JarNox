import { useEffect, useState } from "react";
import CompanySelector from "../components/CompanySelector";
import StockDashboard from "../components/StockDashboard";


const Home = () => {
    const [response, setResponse] = useState("");
    
      const fetchPing = () => {
        fetch("https://jarnox-production.up.railway.app")
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
<div className="container mx-auto px-4 py-8 w-full">
  <div className="flex items-center h-auto">
    <img
      src="/JarNox.png"
      alt="JarNox Logo"
      className="sm:m-4 mb-4 sm:mb-6 h-12 w-12 sm:w-16 sm:h-16 xl:w-24 xl:h-24"
    />
    <div className="ml-3 text-white text-xl sm:text-3xl xl:text-5xl font-bold">
      JarNox
    </div>
  </div>
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