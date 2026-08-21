import React from "react";
import MessageBox from "../../message/_components/MessageBox";
import { AccountPageShell } from "../_components/account-ui";

export const metadata = {
  title: "Messages | My Account",
  description: "User account messaging system",
};

export default function AccountMessagePage() {
  return (
    <AccountPageShell active="message" showProfileCard={false}>
      <div className="w-full overflow-hidden">
        <MessageBox mode="user" heightClass="h-[calc(100vh-230px)] lg:h-[calc(100vh-220px)]" />
      </div>
    </AccountPageShell>
  );
}
