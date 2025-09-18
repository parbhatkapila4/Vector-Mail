import { exchangeAurinkoCodeForToken, getAccountInfo } from "@/lib/aurinko"
import { db } from "@/server/db"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { waitUntil } from "@vercel/functions"
import axios from "axios"

export async function GET(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const params = req.nextUrl.searchParams
    const status = params.get("status")
    if (status !== "success") {
        return NextResponse.json({ message: "Failed to connect to Account" }, { status: 401 })
    }
    const code = params.get("code")
    if (!code) {
        return NextResponse.json({ message: "No code provided" }, { status: 401 })
    }
    const token = await exchangeAurinkoCodeForToken(code)
    if (!token) {
        return NextResponse.json({ message: "Failed to exchange code for token" }, { status: 401 })
    }
    const accountInfo = await getAccountInfo(token.accessToken)
    if (!accountInfo) {
        return NextResponse.json({ message: "Failed to get account info" }, { status: 401 })
    }
    await db.user.upsert({
        where: { emailAddress: accountInfo.email },
        update: {
            id: userId,
        },
        create: {
            id: userId,
            emailAddress: accountInfo.email,
        }
    })

    await db.account.upsert({
        where: {
            id: token.accountId.toString(),
        },
        update: {
            token: token.accessToken,
        },
        create: {
            id: token.accountId.toString(),
            token: token.accessToken,
            emailAddress: accountInfo.email,
            name: accountInfo.name,
            userId: userId,
            provider: "gmail",
        }
    })

    waitUntil(axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
        userId: userId,
        accountId: token.accountId.toString(),
    }).then(() => {
        console.log("Initial sync started")
    }).catch((error) => {
        console.error("Error starting initial sync:", error)
    })
    )


    return NextResponse.redirect(new URL("/mail", process.env.NEXT_PUBLIC_URL))
}