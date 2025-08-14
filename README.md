# 📈 Stock Market Dashboard Web Application

## Overview
This project is a responsive, interactive **Stock Market Dashboard** that allows users to view and analyze historical stock prices for 10 selected companies. It features a scrollable company list on the left panel and a dynamic chart area in the main panel, powered by **D3.js** for rich visualizations.

## Development Approach
The application was built with a **frontend-backend separation** approach. The backend, developed using **FastAPI**, fetches historical stock price data (from a public API) for the selected companies and stores it in a **PostgreSQL** database. The frontend, built in **React**, consumes this API and uses **D3.js** for rendering interactive line charts. **Redux** was used for efficient state management, and **Tailwind CSS** for styling.  

- **Main branch**: Contains code with backend deployed on **Railway** and frontend on **Vercel**, but still in the development phase.  
- **Dev branch**: Contains the locally working version prior to deployment.

## Technologies Used
- **Backend**: FastAPI, PostgreSQL, SQLAlchemy  
- **Frontend**: React, D3.js, Redux, Tailwind CSS  
- **Deployment**: Railway (backend), Vercel (frontend)  

## Challenges Encountered
- Integrating **D3.js** with React’s virtual DOM required careful lifecycle management to avoid rendering issues.  
- Handling **asynchronous API calls** while maintaining smooth chart updates.  
- Optimizing **database queries** to fetch large historical datasets efficiently.  
- Configuring deployment pipelines on **Railway** and **Vercel**, ensuring environment variables and CORS settings worked correctly in production.

  ## 📸 Screenshots

### Dashboard Views
<img width="1920" height="1080" alt="Screenshot From 2025-08-14 19-37-53" src="https://github.com/user-attachments/assets/82a2c43a-5062-4e4c-a840-b04ece40e8a9" />


<img width="1920" height="1080" alt="Screenshot From 2025-08-14 22-51-53" src="https://github.com/user-attachments/assets/5f65ed79-72a7-4809-8baa-bd5e7ad66cd0" />

### Historical Data
<img width="1920" height="1014" alt="image" src="https://github.com/user-attachments/assets/7ad9956e-d72a-44ce-8b54-8a3003686af0" />



