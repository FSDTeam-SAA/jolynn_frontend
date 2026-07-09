export const dynamic = "force-dynamic";

import { AppTopBar } from "../../_component/shared/app-topbar";
import AddEditDoctor from "./_components/add-edit-doctor";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <AddEditDoctor />
      </div>
    </div>
  );
};

export default page;
