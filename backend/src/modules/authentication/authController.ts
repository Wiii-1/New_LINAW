import type { AppContext } from "../../shared/types/hono.js";
import { Context } from "hono";
import { getCookie, deleteCookie } from "hono/cookie"
import { AuthService } from "./authServices.js";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema, findByIdSchema    } from "./authValidator.js";
import { InvalidTokenError } from "../../shared/errors/appError.js";



export class AuthController {
    constructor(private service: AuthService) {
        this.service = service
    }   
    

    getUserById = async (
        c: Context<AppContext>          
    ) => {
            
        const id = findByIdSchema.parse(c.req.param("id"))

        const user = await this.service.findId(id)

        c.json({
            id,
            success: true,
            message: "USER FOUND",
            data: user
        }, 200)
    
    };

    createUser = async (
        c: Context<AppContext>          
    ) => {

        console.log("SIGNUP: controller entered");

        const body = await c.req.json()

        const data = signupSchema.parse(body)

        const result = await this.service.register(data)

        c.json({
            result,
            success: true,
            message: "Account Created"
        }, 200)
    }

    loginUser = async (
        c: Context<AppContext>            
    ) => {

        console.log("LOGIN: controller entered");
        
        const body = await c.req.json()

        const data = loginSchema.parse(body)

        const result = await this.service.login(data)

        c.json({
            result,
            success: true,
            message: "Login Successfully"
        }, 200)

    }

    forgotPassword = async (
        c: Context<AppContext>          
    ) => {

        const body = await c.req.json()

        const data = forgotPasswordSchema.parse(body)

        await this.service.requestPasswordReset(data)
    
        c.json({
            success: true,
            message: "If the account exists, password reset instructions have been sent.",   
        })
    }

    resetPassword = async (
        c: Context<AppContext>          
    ) => {

        const body = await c.req.json()

        const data = resetPasswordSchema.parse(body);
        
        const user = c.get("user");

        await this.service.resetPassword({
            ...data,
            user_id: user.user_id,
        })

        c.json({
            success: true,
            message: "Password reset successfully"
        }, 200)
    }

    logoutUser = async (
        c: Context<AppContext>          
    ): Promise <void> => {

            
        const refreshToken = getCookie(c, "refreshToken")

        if (!refreshToken) {
            throw new InvalidTokenError ("Invalid Token")
        }        

        const result = await this.service.logout(refreshToken)


        deleteCookie(c, "accessToken",{
            httpOnly: true,
            secure: c.env.NODE_ENV === "production",
            sameSite: "Strict"
        })

        deleteCookie(c, "refreshToken", {
            httpOnly: true,
            secure: c.env.NODE_ENV == "producetion",
            sameSite: "Strict"
        })

        c.json({
            success: true,
            message: "Logged out successfully",
            result
        },200)
    }

    refreshToken = async (
        c: Context<AppContext>          
    ) => {

        const refreshToken = getCookie(c, "refreshToken")

        if (!refreshToken) {
            throw new InvalidTokenError ("Invalid Token")
        }          
        
        const token = await this.service.refresh(refreshToken)

        deleteCookie(c, "accessToken", {
            httpOnly: true,
            secure: c.env.NODE_ENV === "production",
            sameSite: "Strict"
        })

        deleteCookie(c, "refreshToken", {
            httpOnly: true,
            secure: c.env.NODE_ENV === "production",
            sameSite: "Strict"
        })

        return c.json({
            success: true,
            message: "Session refreshed successfully",
            token
        },200)
    }

    validate_token = async (
        c: Context<AppContext>
    ) => {
        return c.json ({
            success: true,
            message: "Token is valid"
        },)
    }

}; 