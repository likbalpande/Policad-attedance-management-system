import { Router } from "express";
import { validate } from "@platform/http";
import { requestOtpDto } from "./dto/request-otp-auth.dto";
import { staffLoginDto } from "./dto/staff-login-auth.dto";
import { studentLoginDto } from "./dto/student-login-auth.dto";
import { refreshDto } from "./dto/refresh-auth.dto";
import { requestOtpController } from "./controllers/auth.request-otp.controller";
import { staffLoginController } from "./controllers/auth.staff-login.controller";
import { studentLoginController } from "./controllers/auth.student-login.controller";
import { refreshController } from "./controllers/auth.refresh.controller";

export const authRouter: Router = Router();

authRouter.post("/otp/request", validate(requestOtpDto), requestOtpController);
authRouter.post("/staff/login", validate(staffLoginDto), staffLoginController);
authRouter.post("/student/login", validate(studentLoginDto), studentLoginController);
authRouter.post("/refresh", validate(refreshDto), refreshController);
