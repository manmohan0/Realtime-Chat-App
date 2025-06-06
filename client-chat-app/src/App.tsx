import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Login } from './pages/login'
import { VerifyOTP } from './pages/verifyOTP'
import { CreateAccount } from './pages/CreateAccount'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/verifyotp' element={<VerifyOTP/>}/>
        <Route path='/createaccount' element={<CreateAccount/>}/>
      </Routes>
    </>
  )
}

export default App
