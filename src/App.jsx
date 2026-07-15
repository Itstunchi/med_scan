import { useState } from 'react'

import './App.css'
import Header from './components/header'
import { BrowserRouter, Route, Routes } from 'react-router'
import Home from './pages/home'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path='/home' element={<Home />} > </Route>
        </Routes>


      </BrowserRouter>



      <h2> WELCOME TO MED SCAN</h2>
    </div>
  )
}

export default App
