"use client";

import React from "react";
import QRCode from "react-qr-code";

export function QRCodeGenerator() {
  const value = "https://dr-jameshman-frontend.vercel.app";

  return (
    <div style={{ padding: "2rem", background: "#E6F0F6" }}>
      <QRCode value={value} size={226} />
    </div>
  );
}
