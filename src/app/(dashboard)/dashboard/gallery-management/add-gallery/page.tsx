export const dynamic = "force-dynamic";

import { AppTopBar } from "../../_component/shared/app-topbar";
import AddEditGallery from "./_components/add-edit-gallery";

const page = () => {
  return (
    <div>
      <div className="mb-10 mt-10">
        <AppTopBar />
      </div>

      <div>
        <AddEditGallery />
      </div>
    </div>
  );
};

export default page;
