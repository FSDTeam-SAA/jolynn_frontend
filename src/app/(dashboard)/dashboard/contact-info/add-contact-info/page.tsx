export const dynamic = "force-dynamic";

import { AppTopBar } from "../../_component/shared/app-topbar";
import AddEditContactInfo from "./_components/add-edit-contact-form";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <AddEditContactInfo />
      </div>
    </div>
  );
};

export default page;
