import { Router } from "express";
import { checkUsername } from "../controller/checks";

const checkRouter = Router()

checkRouter.post('/Username', checkUsername)

export { checkRouter }