import { Router } from 'express'
import { generateOtp, verifyOtp, createAccount } from '../controller/authController'

const authRoutes = Router()

authRoutes.post('/generateOtp', generateOtp)
authRoutes.post('/verifyOtp', verifyOtp)
authRoutes.post('/createAccount', createAccount)

export { authRoutes }