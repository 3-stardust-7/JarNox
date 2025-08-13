import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-blue-200 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Vite + React + Tailwind</h1>
      
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg text-center">
        <p className="mb-4 text-lg">You clicked the button:</p>
        <button
          onClick={() => setCount(count + 1)}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-200"
        >
          Count is {count}
        </button>
      </div>

      <p className="mt-6 text-sm text-gray-400">
        Edit <code className="bg-red-700 px-1 py-0.5 rounded">src/App.jsx</code> and save to test HMR
      </p>
    </div>
  );
}

export default App;
