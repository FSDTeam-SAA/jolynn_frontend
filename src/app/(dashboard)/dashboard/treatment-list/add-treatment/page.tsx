export const dynamic = "force-dynamic";

import { AppTopBar } from "../../_component/shared/app-topbar";
import { AddEditTreatmentForm } from "./_components/add-edit-treatment-form";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <AddEditTreatmentForm />
      </div>
    </div>
  );
};

export default page;
