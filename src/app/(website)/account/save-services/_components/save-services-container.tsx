import {
  AccountPageShell,
  SavedBusinessGrid,
} from "../../_components/account-ui";

const SaveServicesContainer = () => {
  return (
    <AccountPageShell active="save-services" showProfileCard={false}>
      <SavedBusinessGrid />
    </AccountPageShell>
  );
};

export default SaveServicesContainer;
