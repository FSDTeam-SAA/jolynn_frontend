"use client";

import { FormEvent, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import DeleteModal from "@/components/modals/delete-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Service = {
  id: number;
  title: string;
  description: string;
};

const initialServices: Service[] = [
  {
    id: 1,
    title: "Emergency Plumbing",
    description: "Fast and reliable plumbing repairs for urgent emergencies.",
  },
  {
    id: 2,
    title: "Drain Cleaning",
    description: "Clear clogged drains quickly for smooth water flow.",
  },
  {
    id: 3,
    title: "Leak Detection",
    description: "Detect and repair hidden water leaks with precision.",
  },
  {
    id: 4,
    title: "Water Heater Repair",
    description: "Professional repair and maintenance for all water heaters.",
  },
];

const emptyDraft = { title: "", description: "" };

function Services() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return services;

    return services.filter(
      (service) =>
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query),
    );
  }, [search, services]);

  const openAddModal = () => {
    setEditingService(null);
    setDraft(emptyDraft);
    setIsFormOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setDraft({ title: service.title, description: service.description });
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingService(null);
    setDraft(emptyDraft);
  };

  const saveService = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = draft.title.trim();
    const description = draft.description.trim();
    if (!title || !description) return;

    if (editingService) {
      setServices((current) =>
        current.map((service) =>
          service.id === editingService.id
            ? { ...service, title, description }
            : service,
        ),
      );
    } else {
      setServices((current) => [
        ...current,
        { id: Date.now(), title, description },
      ]);
    }

    closeFormModal();
  };

  const deleteService = () => {
    if (!serviceToDelete) return;
    setServices((current) =>
      current.filter((service) => service.id !== serviceToDelete.id),
    );
    setServiceToDelete(null);
  };

  return (
    <>
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-[428px]">
            <span className="sr-only">Search services</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="h-[38px] w-full rounded-[10px] border-0 bg-[#EAECED] pl-11 pr-4 text-sm text-[#344054] outline-none placeholder:text-[#667085] focus:ring-2 focus:ring-[#30347F]/20"
            />
          </label>

          <button
            type="button"
            onClick={openAddModal}
            className="flex h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-[#30347F] px-6 text-sm font-medium text-white transition-colors hover:bg-[#252966]"
          >
            <Plus className="h-4 w-4" />
            Add New Services
          </button>
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredServices.map((service) => (
              <article
                key={service.id}
                className="flex min-h-[76px] items-center justify-between gap-4 rounded-[7px] bg-white px-5 py-4"
              >
                <div className="min-w-0">
                  <h2 className="truncate text-[18px] font-medium leading-6 text-[#171717]">
                    {service.title}
                  </h2>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-[#5F6368]">
                    {service.description}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Delete ${service.title}`}
                    onClick={() => setServiceToDelete(service)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#FFF0EF] text-[#FF4D4F] transition-colors hover:bg-[#FFD9D6]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Edit ${service.title}`}
                    onClick={() => openEditModal(service)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#EAF9F0] text-[#20BF6B] transition-colors hover:bg-[#D7F3E2]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] bg-white px-6 py-14 text-center text-sm text-[#667085]">
            No services found.
          </div>
        )}
      </section>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => (open ? setIsFormOpen(true) : closeFormModal())}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-[470px] gap-0 rounded-[12px] border-0 bg-white p-0 shadow-xl [&>button]:right-0 [&>button]:top-0 [&>button]:flex [&>button]:h-9 [&>button]:w-9 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-none [&>button]:rounded-bl-[8px] [&>button]:bg-[#30347F] [&>button]:text-white [&>button]:opacity-100 [&>button_svg]:h-5 [&>button_svg]:w-5">
          <form onSubmit={saveService}>
            <DialogHeader className="px-[18px] pb-4 pt-5 text-left">
              <DialogTitle className="text-[24px] font-semibold leading-8 text-[#263B4A]">
                {editingService ? "Edit Service" : "Add New Services"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {editingService
                  ? "Update this service title and description."
                  : "Enter a title and description for the new service."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-[18px]">
              <label className="block space-y-2 text-xs font-medium text-[#344054]">
                <span>Title</span>
                <input
                  autoFocus
                  required
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Enter Service Title"
                  className="h-[38px] w-full rounded-[2px] border border-[#B9BEC5] px-3 text-sm font-normal text-[#344054] outline-none placeholder:text-[#98A2B3] focus:border-[#30347F] focus:ring-1 focus:ring-[#30347F]"
                />
              </label>

              <label className="block space-y-2 text-xs font-medium text-[#344054]">
                <span>Description</span>
                <textarea
                  required
                  rows={4}
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe your Service..."
                  className="min-h-[88px] w-full resize-none rounded-[2px] border border-[#B9BEC5] px-3 py-3 text-sm font-normal text-[#344054] outline-none placeholder:text-[#98A2B3] focus:border-[#30347F] focus:ring-1 focus:ring-[#30347F]"
                />
              </label>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-2 px-[18px] pb-4 pt-6 sm:space-x-0">
              <button
                type="button"
                onClick={closeFormModal}
                className="h-[36px] cursor-pointer rounded-[6px] border border-[#30347F] text-xs font-medium text-[#30347F] transition-colors hover:bg-[#F3F4FA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[36px] cursor-pointer rounded-[6px] bg-[#30347F] text-xs font-medium text-white transition-colors hover:bg-[#252966]"
              >
                {editingService ? "Save Changes" : "Add Services"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={Boolean(serviceToDelete)}
        onClose={() => setServiceToDelete(null)}
        onConfirm={deleteService}
        title="Delete Service?"
        desc={`Are you sure you want to delete ${serviceToDelete?.title || "this service"}?`}
      />
    </>
  );
}

export default Services;
