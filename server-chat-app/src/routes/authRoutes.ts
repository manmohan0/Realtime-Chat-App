import { Router } from 'express'
import { generateOtp, verifyOtp, createAccount, getUsers } from '../controller/authController'

const authRoutes = Router()

authRoutes.post('/generateOtp', generateOtp)
authRoutes.post('/verifyOtp', verifyOtp)
authRoutes.post('/createAccount', createAccount)
authRoutes.post('/getUsers', getUsers)

export { authRoutes }