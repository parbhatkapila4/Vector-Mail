"use client";

import { Button } from "../ui/button";

function GoogleConnectButton() {
  return (
    <Button onClick={() => { window.location.href = "/api/connect/google"; }}>
      Google
    </Button>
  );
}

export default GoogleConnectButton;
