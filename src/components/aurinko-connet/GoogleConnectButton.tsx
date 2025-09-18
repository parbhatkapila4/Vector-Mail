"use client";
import { getAurinkoAuthUrl } from "@/lib/aurinko";
import { Button } from "../ui/button";
import React from "react";

function GoogleConnectButton() {
  return <Button onClick={async () => {
    const authUrl = await getAurinkoAuthUrl("Google");
    window.location.href = authUrl;
  }}>Google</Button>;
}

export default GoogleConnectButton;
