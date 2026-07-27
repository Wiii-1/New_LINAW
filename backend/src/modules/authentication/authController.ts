import { Request, Response, NextFunction } from "express";
// import { authService } from "./authServices.js";

type createUserbody = {
    full_name:string;
    email: string;
};

type UserParams = {
    id:string;
};

export class authController {
    //constructor(private service = new authService()) {}

    getUserById = async (
        req: Request <UserParams>, 
        res: Response, 
        next:NextFunction
    ) => {
        try {
            const {id} = req.params;
            res.status(200).json({
                id,
                success: true,
                message: "USER FOUND"
            });
        }
        catch (err){
            next(err)
        }
    };

    createUser = async (
        req: Request <createUserbody>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { full_name, email } = req.body
            res.status(200).json({
                full_name, email,
                success: true,
                message: "Account created"
            })
        } catch (err) {
            next (err)
        }
    }

    loginUser = async (
        req: Request <createUserbody > ,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { email } = req.body
            res.status(200).json({
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
    ) => {
        try {
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });

            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error) {
            next(error);
        }
    }


}; 