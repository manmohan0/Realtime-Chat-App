import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Login } from './pages/login'
import { VerifyOTP } from './pages/verifyOTP'
import { CreateAccount } from './pages/CreateAccount'
import { AuthProvider } from './Context/auth.tsx'

function App() {

  return (
    <>
      <AuthProvider>
        <Routes>
            <Route path='/' element={<Home/>}/>
        </Routes>
      </AuthProvider>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/verifyotp' element={<VerifyOTP/>}/>
        <Route path='/createaccount' element={<CreateAccount/>}/>
      </Routes>
    </>
  )
}

export default App
