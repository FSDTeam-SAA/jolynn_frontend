export const dynamic = "force-dynamic";

import { AppTopBar } from "../../_component/shared/app-topbar";
import AddEditPriceListForm from "./_components/add-edit-price-list-form";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <AddEditPriceListForm />
      </div>
    </div>
  );
};

export default page;
