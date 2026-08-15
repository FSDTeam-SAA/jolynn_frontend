"use client";

import DeleteModal from "@/components/modals/delete-modal";
import { useServiceCategories } from "@/hooks/use-service-categories";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, ImageIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type ServiceStatus = "active" | "inactive";

type Service = {
  _id: string;
  ownerId: string;
  title: string;
  description: string;
  logo?: { url: string; publicId: string };
  status: ServiceStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

type ServicesResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: Service[];
};

type ServiceResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Service;
};

type ServiceDraft = {
  category: string;
  requestedCategory: string;
  description: string;
  status: ServiceStatus;
};

const PAGE_LIMIT = 10;
const OTHER_CATEGORY = "__other__";
const emptyDraft: ServiceDraft = {
  category: "",
  requestedCategory: "",
  description: "",
  status: "active",
};

const getApiUrl = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!apiUrl) throw new Error("The services API is not configured.");
  return apiUrl.replace(/\/$/, "");
};

async function readResponse<T extends { success: boolean; message: string }>(response: Response) {
  const result = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "The service request could not be completed.");
  }
  return result;
}

function Services() {
  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user as { token?: string; accessToken?: string } | undefined;
  const token = user?.accessToken ?? user?.token;
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [draft, setDraft] = useState<ServiceDraft>(emptyDraft);
  const [logoFile, setLogoFile] = useState<File>();
  const [logoPreview, setLogoPreview] = useState("");
  const categoriesQuery = useServiceCategories();
  const categories = useMemo(
    () =>
      (categoriesQuery.data?.data ?? [])
        .filter(
          (category) =>
            category.name?.trim() &&
            category.status === "approved" &&
            category.isActive,
        )
        .filter(
          (category, index, list) =>
            list.findIndex(
              (item) =>
                item.name.trim().toLowerCase() ===
                category.name.trim().toLowerCase(),
            ) === index,
        ),
    [categoriesQuery.data?.data],
  );

  const servicesQuery = useQuery<ServicesResponse>({
    queryKey: ["my-services", page],
    queryFn: async () => {
      if (!token) throw new Error("Please sign in to view your services.");
      const params = new URLSearchParams({ sortBy: "createdAt", limit: String(PAGE_LIMIT), page: String(page) });
      const response = await fetch(`${getApiUrl()}/service/my-services?${params}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const result = await readResponse<ServicesResponse>(response);
      if (!Array.isArray(result.data)) throw new Error("The services response is invalid.");
      return result;
    },
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const services = useMemo(() => servicesQuery.data?.data ?? [], [servicesQuery.data?.data]);
  const total = servicesQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return services;
    return services.filter((service) => service.title.toLowerCase().includes(query) || service.description.toLowerCase().includes(query));
  }, [search, services]);

  const saveMutation = useMutation<ServiceResponse, Error>({
    mutationFn: async () => {
      if (!token) throw new Error("Please sign in to save a service.");
      const formData = new FormData();
      formData.append(
        "title",
        draft.category === OTHER_CATEGORY ? "Other" : draft.category.trim(),
      );
      if (draft.category === OTHER_CATEGORY) {
        formData.append("requestedCategory", draft.requestedCategory.trim());
      }
      formData.append("description", draft.description.trim());
      formData.append("status", draft.status);
      if (logoFile) formData.append("logo", logoFile, logoFile.name);

      const endpoint = editingService ? `/service/${encodeURIComponent(editingService._id)}` : "/service";
      const response = await fetch(`${getApiUrl()}${endpoint}`, {
        method: editingService ? "PUT" : "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: formData,
      });
      return readResponse<ServiceResponse>(response);
    },
    onSuccess: async (result) => {
      toast.success(result.message || (editingService ? "Service updated successfully." : "Service created successfully."));
      closeFormModal();
      if (!editingService) setPage(1);
      await queryClient.invalidateQueries({ queryKey: ["my-services"] });
      await queryClient.invalidateQueries({ queryKey: ["business-dashboard-overview"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation<ServiceResponse, Error, Service>({
    mutationFn: async (service) => {
      if (!token) throw new Error("Please sign in to delete a service.");
      const response = await fetch(`${getApiUrl()}/service/${encodeURIComponent(service._id)}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      return readResponse<ServiceResponse>(response);
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Service deleted successfully.");
      setServiceToDelete(null);
      if (services.length === 1 && page > 1) setPage((current) => current - 1);
      await queryClient.invalidateQueries({ queryKey: ["my-services"] });
      await queryClient.invalidateQueries({ queryKey: ["business-dashboard-overview"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const openAddModal = () => {
    setEditingService(null);
    setDraft(emptyDraft);
    setLogoFile(undefined);
    setLogoPreview("");
    setIsFormOpen(true);
  };

  const openEditModal = (service: Service) => {
    if (categoriesQuery.isPending) {
      toast.info("Please wait while service categories are loading.");
      return;
    }
    const matchingCategory = categories.find(
      (category) =>
        category.name.trim().toLowerCase() === service.title.trim().toLowerCase(),
    );
    setEditingService(service);
    setDraft({
      category: matchingCategory?.name.trim() || OTHER_CATEGORY,
      requestedCategory: matchingCategory ? "" : service.title,
      description: service.description,
      status: service.status || "active",
    });
    setLogoFile(undefined);
    setLogoPreview(service.logo?.url || "");
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingService(null);
    setDraft(emptyDraft);
    setLogoFile(undefined);
    setLogoPreview("");
  };

  const handleLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Logo must be smaller than 5 MB.");
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const saveService = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.category.trim()) return toast.error("Service category is required.");
    if (
      draft.category === OTHER_CATEGORY &&
      !draft.requestedCategory.trim()
    ) {
      return toast.error("Please enter your required category.");
    }
    if (!draft.description.trim()) return toast.error("Service description is required.");
    if (draft.requestedCategory.trim().length > 120) return toast.error("Category cannot exceed 120 characters.");
    if (draft.description.trim().length > 1000) return toast.error("Description cannot exceed 1000 characters.");
    saveMutation.mutate();
  };

  const isLoading = sessionStatus === "loading" || (Boolean(token) && servicesQuery.isPending);
  const isMutating = saveMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-[428px]">
            <span className="sr-only">Search services on this page</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." className="h-[38px] w-full rounded-[10px] border-0 bg-[#EAECED] pl-11 pr-4 text-sm text-[#344054] outline-none placeholder:text-[#667085] focus:ring-2 focus:ring-[#30347F]/20" />
          </label>

          <button type="button" onClick={openAddModal} disabled={!token} className="flex h-[38px] items-center justify-center gap-2 rounded-[6px] bg-[#30347F] px-6 text-sm font-medium text-white transition-colors hover:bg-[#252966] disabled:cursor-not-allowed disabled:opacity-50">
            <Plus className="h-4 w-4" /> Add New Services
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[96px] rounded-[7px]" />)}</div>
        ) : servicesQuery.isError || !token ? (
          <div className="rounded-[8px] bg-white px-6 py-14 text-center">
            <p className="text-sm text-red-600">{servicesQuery.error instanceof Error ? servicesQuery.error.message : "Please sign in to view your services."}</p>
            {token && <button type="button" onClick={() => servicesQuery.refetch()} className="mt-3 text-sm font-semibold text-[#30347F] hover:underline">Try again</button>}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredServices.map((service) => (
              <article key={service._id} className="flex min-h-[96px] items-center justify-between gap-4 rounded-[7px] bg-white px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F2F4F7]">
                    {service.logo?.url ? <Image src={service.logo.url} alt={`${service.title} logo`} fill className="object-cover" /> : <ImageIcon className="h-5 w-5 text-[#98A2B3]" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-[18px] font-medium leading-6 text-[#171717]">{service.title}</h2>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${service.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{service.status}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-[#5F6368]">{service.description}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div
                    className="flex h-8 items-center gap-1.5 rounded-full bg-[#F2F4F7] px-3 text-xs font-semibold text-[#667085]"
                    aria-label={`${service.viewCount ?? 0} views`}
                    title={`${service.viewCount ?? 0} views`}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    <span>{service.viewCount ?? 0}</span>
                  </div>
                  <button type="button" disabled={isMutating} aria-label={`Delete ${service.title}`} onClick={() => setServiceToDelete(service)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0EF] text-[#FF4D4F] transition-colors hover:bg-[#FFD9D6] disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                  <button type="button" disabled={isMutating || categoriesQuery.isPending} aria-label={`Edit ${service.title}`} onClick={() => openEditModal(service)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF9F0] text-[#20BF6B] transition-colors hover:bg-[#D7F3E2] disabled:opacity-50"><Pencil className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] bg-white px-6 py-14 text-center text-sm text-[#667085]">{search ? "No matching services found on this page." : "No services found. Add your first service to get started."}</div>
        )}

        {!isLoading && !servicesQuery.isError && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-[7px] bg-white px-4 py-3">
            <p className="text-xs text-[#667085]">Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}</p>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Previous page" disabled={page === 1 || servicesQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] text-[#344054] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
              <span className="text-xs font-medium text-[#344054]">Page {page} of {totalPages}</span>
              <button type="button" aria-label="Next page" disabled={page >= totalPages || servicesQuery.isFetching} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] text-[#344054] disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </section>

      <Dialog open={isFormOpen} onOpenChange={(open) => open ? setIsFormOpen(true) : !saveMutation.isPending && closeFormModal()}>
        <DialogContent className="w-[calc(100%-32px)] max-w-[470px] gap-0 rounded-[12px] border-0 bg-white p-0 shadow-xl [&>button]:right-0 [&>button]:top-0 [&>button]:flex [&>button]:h-9 [&>button]:w-9 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-none [&>button]:rounded-bl-[8px] [&>button]:bg-[#30347F] [&>button]:text-white [&>button]:opacity-100 [&>button_svg]:h-5 [&>button_svg]:w-5">
          <form onSubmit={saveService}>
            <DialogHeader className="px-[18px] pb-4 pt-5 text-left">
              <DialogTitle className="text-[24px] font-semibold leading-8 text-[#263B4A]">{editingService ? "Edit Service" : "Add New Services"}</DialogTitle>
              <DialogDescription className="sr-only">{editingService ? "Update this service." : "Create a new service."}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-[18px]">
              <label className="block space-y-2 text-xs font-medium text-[#344054]">
                <span>Category</span>
                <select
                  autoFocus
                  required
                  value={draft.category}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      category: event.target.value,
                      requestedCategory:
                        event.target.value === OTHER_CATEGORY
                          ? current.requestedCategory
                          : "",
                    }))
                  }
                  className="h-[38px] w-full rounded-[2px] border border-[#B9BEC5] bg-white px-3 text-sm font-normal text-[#344054] outline-none focus:border-[#30347F] focus:ring-1 focus:ring-[#30347F]"
                >
                  <option value="">
                    {categoriesQuery.isPending
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name.trim()}>
                      {category.name.trim()}
                    </option>
                  ))}
                  <option value={OTHER_CATEGORY}>Others</option>
                </select>
              </label>

              {categoriesQuery.isError && (
                <div className="flex items-center justify-between gap-3 rounded-md bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                  <span>Categories could not be loaded. You can select Others.</span>
                  <button
                    type="button"
                    onClick={() => categoriesQuery.refetch()}
                    className="shrink-0 font-semibold underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {draft.category === OTHER_CATEGORY && (
                <label className="block space-y-2 rounded-md border border-[#D9DDF2] bg-[#F8F9FF] p-3 text-xs font-medium text-[#344054]">
                  <span>Add your required category</span>
                  <input
                    required
                    maxLength={120}
                    value={draft.requestedCategory}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        requestedCategory: event.target.value,
                      }))
                    }
                    placeholder="e.g. Solar panel maintenance"
                    className="h-[38px] w-full rounded-[2px] border border-[#B9BEC5] bg-white px-3 text-sm font-normal text-[#344054] outline-none placeholder:text-[#98A2B3] focus:border-[#30347F] focus:ring-1 focus:ring-[#30347F]"
                  />
                  <span className="block text-[10px] font-normal text-[#667085]">
                    This category will be submitted for admin review.
                  </span>
                </label>
              )}
              <label className="block space-y-2 text-xs font-medium text-[#344054]"><span>Description</span><textarea required maxLength={1000} rows={4} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Describe your Service..." className="min-h-[88px] w-full resize-none rounded-[2px] border border-[#B9BEC5] px-3 py-3 text-sm font-normal text-[#344054] outline-none placeholder:text-[#98A2B3] focus:border-[#30347F] focus:ring-1 focus:ring-[#30347F]" /></label>
              {editingService && (
                <label className="block space-y-2 text-xs font-medium text-[#344054]"><span>Status</span><select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as ServiceStatus }))} className="h-[38px] w-full rounded-[2px] border border-[#B9BEC5] bg-white px-3 text-sm font-normal text-[#344054] outline-none focus:border-[#30347F]"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
              )}
              <div className="space-y-2">
                <span className="text-xs font-medium text-[#344054]">Service logo (optional)</span>
                <div className="flex items-center gap-3">
                  <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-[#F2F4F7]">{logoPreview ? <Image src={logoPreview} alt="Service logo preview" fill unoptimized={logoPreview.startsWith("data:")} className="object-cover" /> : <ImageIcon className="h-5 w-5 text-[#98A2B3]" />}</div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                  <button type="button" onClick={() => logoInputRef.current?.click()} className="rounded-md border border-[#B9BEC5] px-3 py-2 text-xs font-medium text-[#344054] hover:bg-[#F9FAFB]">Choose logo</button>
                  <span className="text-[10px] text-[#667085]">Max 5 MB</span>
                </div>
              </div>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-2 px-[18px] pb-4 pt-6 sm:space-x-0">
              <button type="button" disabled={saveMutation.isPending} onClick={closeFormModal} className="h-[36px] rounded-[6px] border border-[#30347F] text-xs font-medium text-[#30347F] transition-colors hover:bg-[#F3F4FA] disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={saveMutation.isPending} className="h-[36px] rounded-[6px] bg-[#30347F] text-xs font-medium text-white transition-colors hover:bg-[#252966] disabled:cursor-not-allowed disabled:opacity-60">{saveMutation.isPending ? "Saving..." : editingService ? "Save Changes" : "Add Services"}</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteModal isOpen={Boolean(serviceToDelete)} onClose={() => !deleteMutation.isPending && setServiceToDelete(null)} onConfirm={() => serviceToDelete && !deleteMutation.isPending && deleteMutation.mutate(serviceToDelete)} title={deleteMutation.isPending ? "Deleting Service..." : "Delete Service?"} desc={`Are you sure you want to delete ${serviceToDelete?.title || "this service"}?`} />
    </>
  );
}

export default Services;
