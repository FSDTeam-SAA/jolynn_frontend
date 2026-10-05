import React from "react";
import AddYourBusinessContainer from "./_components/add-your-business-container";

type AddYourBusinessPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const getSearchParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

const AddYourBusinessPage = ({ searchParams }: AddYourBusinessPageProps) => {
  const claimPrefill = {
    isReferralClaim: getSearchParam(searchParams.claim) === "referral",
    businessName: getSearchParam(searchParams.businessName),
    businessEmail: getSearchParam(searchParams.businessEmail),
    category: getSearchParam(searchParams.category),
    state: getSearchParam(searchParams.state),
    city: getSearchParam(searchParams.city),
  };

  return <AddYourBusinessContainer claimPrefill={claimPrefill} />;
};

export default AddYourBusinessPage;
