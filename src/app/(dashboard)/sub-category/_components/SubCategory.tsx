"use client";

import DeleteModal from "@/components/modals/delete-modal";
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
import {
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Minus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type Service = { _id: string; title: string };
type PopulatedService = Service & { ownerId?: string };
type SubCategoryItem = {
  _id: string;
  serviceId: string | PopulatedService;
  subcategory: string;
  createdAt?: string;
  updatedAt?: string;
};
type ApiMeta = { page: number; limit: number; total: number };
type ApiResponse<T> = {
  statusCode?: number;
  success?: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
};

const PAGE_LIMIT = 20;

const getApiUrl = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_API_URL ??
    "https://api.sidequote.cloud/api/v1";
  return apiUrl.replace(/\/$/, "");
};

async function readResponse<T>(response: Response) {
  const result = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !result)
    throw new Error(result?.message || "The request could not be completed.");
  return result;
}

const getService = (item: SubCategoryItem) =>
  typeof item.serviceId === "string" ? null : item.serviceId;
const getServiceId = (item: SubCategoryItem) =>
  typeof item.serviceId === "string" ? item.serviceId : item.serviceId._id;

function SubCategory() {
  const { data: session } = useSession();
  const user = session?.user as
    | { token?: string; accessToken?: string }
    | undefined;
  const token = user?.accessToken ?? user?.token;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubCategoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<SubCategoryItem | null>(
    null,
  );
  const [serviceId, setServiceId] = useState("");
  const [names, setNames] = useState([""]);

  const subCategoriesQuery = useQuery<ApiResponse<SubCategoryItem[]>>({
    queryKey: ["sub-categories", page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(PAGE_LIMIT),
        page: String(page),
      });
      const response = await fetch(
        `${getApiUrl()}/sub-categories/my-sub-categories?${params}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return readResponse<SubCategoryItem[]>(response);
    },
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });

  const servicesQuery = useQuery<ApiResponse<Service[]>>({
    queryKey: ["my-services-for-sub-category"],
    queryFn: async () => {
      if (!token) throw new Error("Please sign in to load your services.");
      const params = new URLSearchParams({
        sortBy: "createdAt",
        limit: "10",
        page: "1",
      });
      const response = await fetch(
        `${getApiUrl()}/service/my-services?${params}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return readResponse<Service[]>(response);
    },
    enabled: Boolean(token),
    staleTime: 30_000,
  });

  const items = useMemo(
    () => subCategoriesQuery.data?.data ?? [],
    [subCategoriesQuery.data?.data],
  );
  const services = useMemo(
    () => servicesQuery.data?.data ?? [],
    [servicesQuery.data?.data],
  );
  const total = subCategoriesQuery.data?.meta?.total ?? items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.subcategory.toLowerCase().includes(query) ||
        (getService(item)?.title ?? "").toLowerCase().includes(query),
    );
  }, [items, search]);

  const saveMutation = useMutation<
    ApiResponse<SubCategoryItem | SubCategoryItem[]>,
    Error
  >({
    mutationFn: async () => {
      if (!token) throw new Error("Please sign in to manage sub categories.");
      const cleanNames = names.map((name) => name.trim()).filter(Boolean);
      const endpoint = editingItem
        ? `/sub-categories/${encodeURIComponent(editingItem._id)}`
        : "/sub-categories";
      const body = editingItem
        ? { serviceId, subcategory: cleanNames[0] }
        : { serviceId, subcategories: cleanNames };
      const response = await fetch(`${getApiUrl()}${endpoint}`, {
        method: editingItem ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      return readResponse<SubCategoryItem | SubCategoryItem[]>(response);
    },
    onSuccess: async (result) => {
      toast.success(
        result.message ||
          (editingItem
            ? "Sub category updated successfully."
            : "Sub categories created successfully."),
      );
      closeFormModal();
      if (!editingItem) setPage(1);
      await queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["my-services"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation<
    ApiResponse<SubCategoryItem>,
    Error,
    SubCategoryItem
  >({
    mutationFn: async (item) => {
      if (!token) throw new Error("Please sign in to delete a sub category.");
      const response = await fetch(
        `${getApiUrl()}/sub-categories/${encodeURIComponent(item._id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return readResponse<SubCategoryItem>(response);
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Sub category deleted successfully.");
      setItemToDelete(null);
      if (items.length === 1 && page > 1) setPage((current) => current - 1);
      await queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["my-services"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const openAddModal = () => {
    setEditingItem(null);
    setServiceId(services[0]?._id ?? "");
    setNames([""]);
    setIsFormOpen(true);
  };

  const openEditModal = (item: SubCategoryItem) => {
    setEditingItem(item);
    setServiceId(getServiceId(item));
    setNames([item.subcategory]);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setServiceId("");
    setNames([""]);
  };

  const updateName = (index: number, value: string) =>
    setNames((current) =>
      current.map((name, itemIndex) => (itemIndex === index ? value : name)),
    );
  const addNameField = () =>
    setNames((current) => (current.length < 50 ? [...current, ""] : current));
  const removeNameField = (index: number) =>
    setNames((current) =>
      current.length === 1
        ? current
        : current.filter((_, itemIndex) => itemIndex !== index),
    );

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanNames = names.map((name) => name.trim()).filter(Boolean);
    if (!serviceId) return toast.error("Please select a service.");
    if (!cleanNames.length)
      return toast.error("Please add at least one sub category.");
    if (
      new Set(cleanNames.map((name) => name.toLowerCase())).size !==
      cleanNames.length
    )
      return toast.error("Duplicate sub categories are not allowed.");
    saveMutation.mutate();
  };

  const isLoading = subCategoriesQuery.isPending;
  const isMutating = saveMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-[428px]">
            <span className="sr-only">Search sub categories on this page</span>
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
            disabled={!token || servicesQuery.isPending}
            className="flex h-[38px] items-center justify-center gap-2 rounded-[6px] bg-[#30347F] px-6 text-sm font-medium text-white transition-colors hover:bg-[#252966] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add Sub Category
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[96px] rounded-[7px]" />
            ))}
          </div>
        ) : subCategoriesQuery.isError ? (
          <div className="rounded-[8px] bg-white px-6 py-14 text-center">
            <p className="text-sm text-red-600">
              {subCategoriesQuery.error.message}
            </p>
            <button
              type="button"
              onClick={() => subCategoriesQuery.refetch()}
              className="mt-3 text-sm font-semibold text-[#30347F] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredItems.length ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredItems.map((item) => (
              <article
                key={item._id}
                className="flex min-h-[96px] items-center justify-between gap-4 rounded-[7px] bg-white px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EEF1FF]">
                    <FolderTree className="h-5 w-5 text-[#30347F]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-[18px] font-medium leading-6 text-[#171717]">
                      {item.subcategory}
                    </h2>
                    <p className="mt-1 truncate text-[13px] leading-5 text-[#5F6368]">
                      Service:{" "}
                      <span className="font-medium text-[#30347F]">
                        {getService(item)?.title ?? "Service unavailable"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={isMutating || !token}
                    aria-label={`Delete ${item.subcategory}`}
                    onClick={() => setItemToDelete(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0EF] text-[#FF4D4F] transition-colors hover:bg-[#FFD9D6] disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isMutating || !token || servicesQuery.isPending}
                    aria-label={`Edit ${item.subcategory}`}
                    onClick={() => openEditModal(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF9F0] text-[#20BF6B] transition-colors hover:bg-[#D7F3E2] disabled:opacity-40"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] bg-white px-6 py-14 text-center text-sm text-[#667085]">
            {search
              ? "No matching sub categories found on this page."
              : "No sub categories found."}
          </div>
        )}

        {!isLoading && !subCategoriesQuery.isError && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-[7px] bg-white px-4 py-3">
            <p className="text-xs text-[#667085]">
              Showing {(page - 1) * PAGE_LIMIT + 1}–
              {Math.min(page * PAGE_LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                disabled={page === 1 || subCategoriesQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] text-[#344054] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-[#344054]">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                aria-label="Next page"
                disabled={page >= totalPages || subCategoriesQuery.isFetching}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] text-[#344054] disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) =>
          open
            ? setIsFormOpen(true)
            : !saveMutation.isPending && closeFormModal()
        }
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-[470px] gap-0 rounded-[12px] border-0 bg-white p-0 shadow-xl [&>button]:right-0 [&>button]:top-0 [&>button]:flex [&>button]:h-9 [&>button]:w-9 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-none [&>button]:rounded-bl-[8px] [&>button]:bg-[#30347F] [&>button]:text-white [&>button]:opacity-100 [&>button_svg]:h-5 [&>button_svg]:w-5">
          <form onSubmit={submitForm}>
            <DialogHeader className="px-[18px] pb-4 pt-5 text-left">
              <DialogTitle className="text-[24px] font-semibold leading-8 text-[#263B4A]">
                {editingItem ? "Edit Sub Category" : "Add Sub Category"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {editingItem
                  ? "Update this sub category."
                  : "Add one or more sub categories."}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] space-y-4 overflow-y-auto px-[18px]">
              <label className="block space-y-2 text-xs font-medium text-[#344054]">
                <span>Service</span>
                <select
                  required
                  value={serviceId}
                  onChange={(event) => setServiceId(event.target.value)}
                  disabled={servicesQuery.isPending}
                  className="h-[38px] w-full rounded-[2px] border border-[#B9BEC5] bg-white px-3 text-sm font-normal text-[#344054] outline-none focus:border-[#30347F] focus:ring-1 focus:ring-[#30347F] disabled:bg-[#F2F4F7]"
                >
                  <option value="" disabled>
                    {servicesQuery.isPending
                      ? "Loading services..."
                      : "Select a service"}
                  </option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.title}
                    </option>
                  ))}
                </select>
                {servicesQuery.isError && (
                  <span className="block text-[11px] font-normal text-red-600">
                    {servicesQuery.error.message}
                  </span>
                )}
                {!servicesQuery.isPending &&
                  !servicesQuery.isError &&
                  services.length === 0 && (
                    <span className="block text-[11px] font-normal text-amber-600">
                      You need to add a service first.
                    </span>
                  )}
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#344054]">
                    Sub Category
                  </span>
                  {!editingItem && (
                    <span className="text-[10px] text-[#667085]">Up to 50</span>
                  )}
                </div>
                <div className="space-y-2">
                  {names.map((name, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        required
                        maxLength={120}
                        autoFocus={index === 0}
                        value={name}
                        onChange={(event) =>
                          updateName(index, event.target.value)
                        }
                        placeholder={`Enter sub category${names.length > 1 ? ` ${index + 1}` : ""}`}
                        className="h-[38px] min-w-0 flex-1 rounded-[2px] border border-[#B9BEC5] px-3 text-sm font-normal text-[#344054] outline-none placeholder:text-[#98A2B3] focus:border-[#30347F] focus:ring-1 focus:ring-[#30347F]"
                      />
                      {!editingItem &&
                        (index === names.length - 1 ? (
                          <button
                            type="button"
                            onClick={addNameField}
                            disabled={names.length >= 50}
                            aria-label="Add another sub category field"
                            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[4px] bg-[#30347F] text-white transition-colors hover:bg-[#252966] disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeNameField(index)}
                            aria-label={`Remove sub category field ${index + 1}`}
                            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[4px] bg-[#FFF0EF] text-[#FF4D4F] transition-colors hover:bg-[#FFD9D6]"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
                {!editingItem && (
                  <p className="text-[10px] font-normal text-[#667085]">
                    Use the plus button to add multiple sub categories at once.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="grid grid-cols-2 gap-2 px-[18px] pb-4 pt-6 sm:space-x-0">
              <button
                type="button"
                disabled={saveMutation.isPending}
                onClick={closeFormModal}
                className="h-[36px] rounded-[6px] border border-[#30347F] text-xs font-medium text-[#30347F] transition-colors hover:bg-[#F3F4FA] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  saveMutation.isPending ||
                  servicesQuery.isPending ||
                  services.length === 0
                }
                className="h-[36px] rounded-[6px] bg-[#30347F] text-xs font-medium text-white transition-colors hover:bg-[#252966] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saveMutation.isPending
                  ? "Saving..."
                  : editingItem
                    ? "Save Changes"
                    : "Add Sub Category"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => !deleteMutation.isPending && setItemToDelete(null)}
        onConfirm={() =>
          itemToDelete &&
          !deleteMutation.isPending &&
          deleteMutation.mutate(itemToDelete)
        }
        title={
          deleteMutation.isPending
            ? "Deleting Sub Category..."
            : "Delete Sub Category?"
        }
        desc={`Are you sure you want to delete ${itemToDelete?.subcategory || "this sub category"}?`}
      />
    </>
  );
}

export default SubCategory;
