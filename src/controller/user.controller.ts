import { Request, Response } from "express";
import {
  CreateUserInput,
  ForgotPasswordInput,
  VerifyUserInput,
} from "../schema/user.schema";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../service/user.service";
import sendEmail from "../utils/mailer";
import log from "../utils/logger";
import { nanoid } from "nanoid";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  const body = req.body;
  log.info("createUserHandler");
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

export async function verifyUserHandler(
  req: Request<VerifyUserInput>,
  res: Response
) {
  const id = req.params.id;
  const verificationCode = req.params.verificationCode;

  //find user by id
  const user = await findUserById(id);

  if (!user) {
    return res.send("Could not verify user!");
  }

  if (user.verified) {
    return res.send("User is already verified");
  }

  if (user.verificationCode === verificationCode) {
    user.verified = true;
    await user.save();
    return res.send("User successfully verified");
  }

  return res.send("Could not verify user!");
}

export async function forgotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response
) {
  const message =
    "If a user with that email is registered yo will receive a password reset email";

  const email = req.body.email;

  //find user by email
  const user = await findUserByEmail(email);

  if (!user) {
    log.debug(`User with email ${email} does not exists`);
    return res.send(message);
  }

  if (!user.verified) {
    return res.send("User is not verified");
  }

  const passwordResetCode = nanoid();

  user.passwordResetCode = passwordResetCode;
  await user.save();

  await sendEmail({
    to: email,
    from: "test@example.com",
    subject: "Reset your password",
    text: `Password rest code: ${passwordResetCode}. Id ${user._id}`,
  });

  log.debug(`Password reset code sent to email: ${email}`);
  return res.send(message);
}
