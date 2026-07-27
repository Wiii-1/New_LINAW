import { Request, Response, NextFunction } from "express";
import { AuthService } from "./authServices.js";
import { signupSchema, findByIdSchema, loginSchema, logoutSchema } from "./authValidator.js";


export class AuthController {
    constructor(private service: AuthService) {
        this.service = service
    }   

    getUserById = async (
        req: Request,
        res: Response, 
        next:NextFunction
    ): Promise<void> => {
        try {
            
            const id = findByIdSchema.parse(req.params.id)

            const user = await this.service.findId(id)

            res.status(200).json({
                id,
                success: true,
                message: "USER FOUND",
                data:user
            });
        }
        catch (err){
            next(err)
        }
    };

    createUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {

            const data = signupSchema.parse(req.body)

            const result = await this.service.register(data)

            res.status(200).json({
                result,
                success: true,
                message: "Account created"
            })
        } catch (err) {
            next (err)
        }
    }

    loginUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void>  => {
        try {
            const data = loginSchema.parse(req.body)

            const result = await this.service.login(data)

            res.status(200).json({
                result,
                success: true,
                message: "Login Successfully"
            })
        } catch (err) {
            next (err)
        }
    }

    logoutUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            
            const refreshToken = req.cookies.refreshToken

            const result = await this.service.logout(refreshToken)

            res.clearCookie("accessToken", {
                httpOnly: true,
                secure:process.env.NODE_ENV === "production",
                sameSite: "strict"
            })

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure:process.env.NODE_ENV === "production",
                sameSite: "strict"
            })

            res.status(200).json({
                success: true,
                message: "Logged out successfully",
                result
            });
        } catch (error) {
            next(error);
        }
    }

    refreshToken = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
         try {

            const refreshToken = req.cookies.refreshToken
            
            const token = await this.service.refresh(refreshToken)

            res.clearCookie("accessToken", {
                httpOnly: true,
                secure:process.env.NODE_ENV === "production",
                sameSite: "strict"
            })

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure:process.env.NODE_ENV === "production",
                sameSite: "strict"
            })

            res.status(200).json({
                success: true,
                message: "Session refreshed successfully",
                token
            });
        } catch (error) {
            next(error);
        }
    }

    validate_token = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            res.status(200).json({
                success: true,
                message: "Token is valid",
            });
        } catch (error) {
            next(error);
        }
    }

}; 