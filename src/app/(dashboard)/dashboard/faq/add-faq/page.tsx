export const dynamic = "force-dynamic";

import { AppTopBar } from "../../_component/shared/app-topbar";
import AddEditFaq from "./_components/add-edit-faq";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <AddEditFaq />
      </div>
    </div>
  );
};

export default page;
