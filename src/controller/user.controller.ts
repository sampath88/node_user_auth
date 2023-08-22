import { Request, Response } from "express";
import { CreateUserInput } from "../schema/user.schema";
import { createUser } from "../service/user.service";
import sendEmail from "../utils/mailer";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  const body = req.body;

  try {
    const user = await createUser(body); //here we are not checking if user
    //exist before creating user
    //because we have 'unique' constraint on user model [email]
    //if you try to create user which is already exists by the email
    //we are going to throw the error
    //then catch block will be executed.

    //after creating user. send email to user
    await sendEmail({
      from: "test@example.com", //provide your email here
      to: user.email,
      subject: "Please verify your account",
      text: `verification code ${user.verificationCode}. Id: ${user._id}`,
    });

    return res.send("User successfully created");
  } catch (e: any) {
    if (e.code === 11000) {
      // 11000 means a unique contstraint has been violated.
      return res.status(409).send("Account already exists");
      //status: 409 means there is a confilct
    }

    return res.status(500).send(e);
  }
}
