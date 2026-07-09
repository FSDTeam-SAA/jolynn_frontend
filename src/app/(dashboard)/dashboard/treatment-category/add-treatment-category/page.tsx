export const dynamic = "force-dynamic";

import { AppTopBar } from "../../_component/shared/app-topbar";
import { AddEditTreatmentCategory } from "./_components/add-edit-treatment-category";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <AddEditTreatmentCategory />
      </div>
    </div>
  );
};

export default page;
