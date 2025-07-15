/* eslint-disable @typescript-eslint/ban-ts-comment */
import nodemailer, { Transporter } from "nodemailer";

import { config } from "dotenv";

export interface IEmail {
  email: string;
  subject: string;
  text: string;
  html: string;
}

config({ path: "./.env" });

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  DEV_SMTP_HOST,
  DEV_SMTP_PORT,
  DEV_SMTP_USERNAME,
  DEV_SMTP_PASSWORD,
} = process.env;

export default async function emailService(options: IEmail) {
  let smtpHost: string;
  let smtpPort: string;
  let smtpUsername: string;
  let smtpPassword: string;
  let tls: boolean;
  if (process.env.NODE_ENV === "development") {
    smtpHost = DEV_SMTP_HOST!;
    smtpPort = DEV_SMTP_PORT!;
    smtpUsername = DEV_SMTP_USERNAME!;
    smtpPassword = DEV_SMTP_PASSWORD!;
    tls = false;
  } else {
    smtpHost = SMTP_HOST!;
    smtpPort = SMTP_PORT!;
    smtpUsername = SMTP_USERNAME!;
    smtpPassword = SMTP_PASSWORD!;
    tls = true;
  }
  const transporter = nodemailer.createTransport<Transporter>({
    // @ts-ignore
    host: smtpHost,
    port: Number(smtpPort),
    tls: tls,
    auth: {
      user: smtpUsername,
      pass: smtpPassword,
    },
  });

  await transporter.sendMail({
    from: "Pizza Passion <info@aminebadi.ir>",
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}
