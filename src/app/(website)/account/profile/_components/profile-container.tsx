import { AccountPageShell, AccountPanel } from "../../_components/account-ui";

const profileFields = [
  {
    id: "firstName",
    label: "First Name",
    value: "Olivia",
  },
  {
    id: "lastName",
    label: "Last Name",
    value: "Rhye",
  },
  {
    id: "email",
    label: "Email Address",
    value: "bessieedwards@gmail.com",
  },
  {
    id: "phone",
    label: "Phone Number",
    value: "+1 (555) 123-4567",
  },
  {
    id: "street",
    label: "Street Address",
    value: "1234 Oak Avenue, San Francisco, CA 94102A",
    wide: true,
  },
  {
    id: "location",
    label: "Location",
    value: "Florida, USA",
  },
  {
    id: "postalCode",
    label: "Postal Code",
    value: "30301",
  },
];

const ProfileContainer = () => {
  return (
    <AccountPageShell active="profile">
      <AccountPanel
        title="Personal Information"
        description="Manage your personal information and profile details."
      >
        <div className="flex items-center gap-5 text-[12px] font-medium text-[#111827]">
          <label className="flex items-center gap-2">
            Male
            <input type="radio" name="gender" className="h-3.5 w-3.5" />
          </label>
          <label className="flex items-center gap-2">
            Female
            <input
              type="radio"
              name="gender"
              defaultChecked
              className="h-3.5 w-3.5 accent-[#292D73]"
            />
          </label>
        </div>

        <form className="mt-7 space-y-5">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            {profileFields.map((field) => (
              <label
                key={field.id}
                className={field.wide ? "md:col-span-2" : undefined}
              >
                <span className="text-[12px] font-semibold text-[#111827]">
                  {field.label}
                </span>
                <input
                  defaultValue={field.value}
                  className="mt-2 h-10 w-full rounded-[2px] border border-[#B8C0CC] bg-white px-4 text-[12px] font-medium text-[#667085] outline-none focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15"
                />
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="h-10 rounded-[4px] border border-[#8A94A6] px-4 text-[12px] font-semibold text-[#475467] transition hover:bg-[#F8FAFC]"
            >
              Discard Changes
            </button>
            <button
              type="button"
              className="h-10 rounded-[4px] bg-[#292D73] px-5 text-[12px] font-extrabold text-white transition hover:bg-[#20255F]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </AccountPanel>
    </AccountPageShell>
  );
};

export default ProfileContainer;
