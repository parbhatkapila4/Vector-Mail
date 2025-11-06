"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID!,
    serviceType,
    scopes: " Mail.Read Mail.Send Mail.Drafts Mail.All Mail.ReadWrite",
    responseType: "code",
    returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
  });
  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

export async function exchangeAurinkoCodeForToken(code: string) {
  try {
    const response = await axios.get(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {
        auth: {
          username: process.env.AURINKO_CLIENT_ID!,
          password: process.env.AURINKO_CLIENT_SECRET!,
        },
      },
    );
    
    return response.data as {
      accountId: number;
      accessToken: string;
      userId: string;
      userSession: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Token exchange failed:", error.response?.data);
    }
    console.error("Aurinko error:", error);
  }
}

export async function getAccountInfo(accessToken: string) {
  try {
    const response = await axios.get(`https://api.aurinko.io/v1/account`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    return response.data as {
      email: string;
      name: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Account info failed:", error.response?.data);
    }
    console.error("Aurinko error:", error);
  }
}
