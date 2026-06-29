const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel =
require("../models/userModel");

class AuthController {

    async signup(req, res) {

        const {

            full_name,
            email,
            password,
            role,
            department

        } = req.body;

        userModel.findUserByEmail(

            email,

            async (err, rows) => {

                if (err) {

                    return res.status(500).json(err);

                }

                if (rows.length > 0) {

                    return res.status(400).json({

                        message:
                        "Email already exists"

                    });

                }

                try {

                    const hashedPassword =
                    await bcrypt.hash(password, 10);

                    userModel.createUser(

                        {

                            full_name,
                            email,
                            password: hashedPassword,
                            role,
                            department

                        },

                        (err, result) => {

                            if (err) {

                                return res.status(500).json(err);

                            }

                            res.status(201).json({

                                message:
                                "User Registered Successfully"

                            });

                        }

                    );

                } catch (error) {

                    return res.status(500).json({

                        message:
                        "Password Hashing Error"

                    });

                }

            }

        );

    }

    login(req, res) {

        const {

            email,
            password

        } = req.body;

        userModel.findUserByEmail(

            email,

            async (err, rows) => {

                if (err) {

                    return res.status(500).json(err);

                }

                if (rows.length === 0) {

                    return res.status(400).json({

                        message:
                        "Invalid Email"

                    });

                }

                const user = rows[0];

                const isMatch =
                await bcrypt.compare(

                    password,

                    user.password

                );

                if (!isMatch) {

                    return res.status(400).json({

                        message:
                        "Invalid Password"

                    });

                }

                const token = jwt.sign(

                    {

                        user_id: user.user_id,
                        role: user.role

                    },

                    process.env.JWT_SECRET,

                    {

                        expiresIn: "7d"

                    }

                );

                res.status(200).json({

                    message:
                    "Login Successful",

                    token,

                    role: user.role,

                    full_name: user.full_name

                });

            }

        );

    }

    profile(req, res) {

        res.status(200).json({

            message: "Profile Loaded",

            user: req.user

        });

    }

}

module.exports =
new AuthController();