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
import { ChevronLeft, ChevronRight, ImageIcon, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type GalleryImage = { url: string; publicId: string };
type GalleryItem = {
  _id: string;
  userId: string;
  title: string;
  images: GalleryImage[];
  createdAt: string;
  updatedAt: string;
};
type GalleryListResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: GalleryItem[];
};
type GalleryResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: GalleryItem;
};
type NewImage = { file: File; preview: string };

const PAGE_LIMIT = 10;
const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The gallery API is not configured.");
  return apiUrl.replace(/\/$/, "");
};

async function readResponse<T extends { success: boolean; message: string }>(response: Response) {
  const result = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || !result?.success) throw new Error(result?.message || "The gallery request could not be completed.");
  return result;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

function GalleryImageCarousel({ item, disabled, onEdit }: { item: GalleryItem; disabled: boolean; onEdit: () => void }) {
  const [activeImage, setActiveImage] = useState(0);
  const imageCount = item.images.length;
  const currentImage = item.images[Math.min(activeImage, Math.max(0, imageCount - 1))];
  const showControls = imageCount > 1;

  const showPreviousImage = () => setActiveImage((current) => (current - 1 + imageCount) % imageCount);
  const showNextImage = () => setActiveImage((current) => (current + 1) % imageCount);

  return (
    <div className="relative aspect-[1.6/1] w-full overflow-hidden bg-[#EAECF0]">
      {currentImage?.url ? (
        <Image src={currentImage.url} alt={`${item.title} image ${activeImage + 1}`} fill className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-[#98A2B3]" /></div>
      )}

      <button type="button" disabled={disabled} onClick={onEdit} aria-label={`Edit ${item.title}`} className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#30347F] shadow-sm hover:bg-white disabled:opacity-50"><Pencil className="h-3.5 w-3.5" /></button>

      {showControls && <>
        <button type="button" onClick={showPreviousImage} aria-label="Previous image" className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={showNextImage} aria-label="Next image" className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75"><ChevronRight className="h-4 w-4" /></button>
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2 py-1">
          {item.images.map((image, index) => <button key={image.publicId} type="button" onClick={() => setActiveImage(index)} aria-label={`Show image ${index + 1}`} aria-current={activeImage === index} className={`h-1.5 rounded-full transition-all ${activeImage === index ? "w-4 bg-white" : "w-1.5 bg-white/60 hover:bg-white"}`} />)}
        </div>
      </>}
    </div>
  );
}

function MyGallery() {
  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user as { token?: string; accessToken?: string } | undefined;
  const token = user?.accessToken ?? user?.token;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [title, setTitle] = useState("");
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  const galleryQuery = useQuery<GalleryListResponse>({
    queryKey: ["my-gallery", page],
    queryFn: async () => {
      if (!token) throw new Error("Please sign in to view your gallery.");
      const params = new URLSearchParams({ sortBy: "createdAt", limit: String(PAGE_LIMIT), page: String(page) });
      const response = await fetch(`${getApiUrl()}/gallary/my-gallaries?${params}`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
      const result = await readResponse<GalleryListResponse>(response);
      if (!Array.isArray(result.data)) throw new Error("The gallery response is invalid.");
      return result;
    },
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const gallery = useMemo(() => galleryQuery.data?.data ?? [], [galleryQuery.data?.data]);
  const total = galleryQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const filteredGallery = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? gallery.filter((item) => item.title.toLowerCase().includes(query)) : gallery;
  }, [gallery, search]);

  const saveMutation = useMutation<GalleryResponse, Error>({
    mutationFn: async () => {
      if (!token) throw new Error("Please sign in to save gallery items.");
      const formData = new FormData();
      formData.append("title", title.trim());
      newImages.forEach(({ file }) => formData.append("images", file, file.name));
      if (editingItem && removedImageIds.length) formData.append("removeImagePublicIds", JSON.stringify(removedImageIds));
      const endpoint = editingItem ? `/gallary/${encodeURIComponent(editingItem._id)}` : "/gallary";
      const response = await fetch(`${getApiUrl()}${endpoint}`, {
        method: editingItem ? "PUT" : "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: formData,
      });
      return readResponse<GalleryResponse>(response);
    },
    onSuccess: async (result) => {
      const wasEditing = Boolean(editingItem);
      toast.success(result.message || (wasEditing ? "Gallery updated successfully." : "Gallery created successfully."));
      closeFormModal();
      if (!wasEditing) setPage(1);
      await queryClient.invalidateQueries({ queryKey: ["my-gallery"] });
      await queryClient.invalidateQueries({ queryKey: ["business-dashboard-overview"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation<GalleryResponse, Error, GalleryItem>({
    mutationFn: async (item) => {
      if (!token) throw new Error("Please sign in to delete gallery items.");
      const response = await fetch(`${getApiUrl()}/gallary/${encodeURIComponent(item._id)}`, { method: "DELETE", headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
      return readResponse<GalleryResponse>(response);
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Gallery item deleted successfully.");
      setItemToDelete(null);
      if (gallery.length === 1 && page > 1) setPage((current) => current - 1);
      await queryClient.invalidateQueries({ queryKey: ["my-gallery"] });
      await queryClient.invalidateQueries({ queryKey: ["business-dashboard-overview"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    newImages.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setEditingItem(null);
    setTitle("");
    setNewImages([]);
    setRemovedImageIds([]);
  };
  const closeFormModal = () => { setIsFormOpen(false); resetForm(); };
  const openAddModal = () => { resetForm(); setIsFormOpen(true); };
  const openEditModal = (item: GalleryItem) => {
    resetForm();
    setEditingItem(item);
    setTitle(item.title);
    setIsFormOpen(true);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    if (newImages.length + files.length > 10) {
      event.target.value = "";
      return toast.error("You can upload up to 10 images at a time.");
    }
    const invalid = files.find((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024);
    if (invalid) {
      event.target.value = "";
      return toast.error("Each file must be an image smaller than 5 MB.");
    }
    setNewImages((current) => [...current, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    event.target.value = "";
  };

  const removeNewImage = (index: number) => setNewImages((current) => {
    URL.revokeObjectURL(current[index].preview);
    return current.filter((_, currentIndex) => currentIndex !== index);
  });
  const toggleExistingImage = (publicId: string) => setRemovedImageIds((current) => current.includes(publicId) ? current.filter((id) => id !== publicId) : [...current, publicId]);

  const saveGallery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return toast.error("Gallery title is required.");
    if (title.trim().length > 150) return toast.error("Title cannot exceed 150 characters.");
    if (!editingItem && !newImages.length) return toast.error("Please select at least one image.");
    saveMutation.mutate();
  };

  const isLoading = sessionStatus === "loading" || (Boolean(token) && galleryQuery.isPending);
  const isMutating = saveMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <section>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-[340px]"><span className="sr-only">Search gallery on this page</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." className="h-[36px] w-full rounded-[8px] border-0 bg-[#EAECED] pl-9 pr-4 text-xs text-[#344054] outline-none placeholder:text-[#667085] focus:ring-2 focus:ring-[#30347F]/20" /></label>
          <button type="button" disabled={!token} onClick={openAddModal} className="flex h-[36px] items-center justify-center gap-2 rounded-[5px] bg-[#30347F] px-5 text-xs font-medium text-white transition-colors hover:bg-[#252966] disabled:opacity-50"><Plus className="h-4 w-4" />Add Image</button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="aspect-[1.6/1] rounded-[7px]" />)}</div>
        ) : galleryQuery.isError || !token ? (
          <div className="rounded-[8px] bg-white px-6 py-14 text-center"><p className="text-sm text-red-600">{galleryQuery.error instanceof Error ? galleryQuery.error.message : "Please sign in to view your gallery."}</p>{token && <button type="button" onClick={() => galleryQuery.refetch()} className="mt-3 text-sm font-semibold text-[#30347F] hover:underline">Try again</button>}</div>
        ) : filteredGallery.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredGallery.map((item) => (
              <article key={item._id} className="group overflow-hidden rounded-[7px] bg-white transition-shadow hover:shadow-md">
                <GalleryImageCarousel item={item} disabled={isMutating} onEdit={() => openEditModal(item)} />
                <div className="flex items-center justify-between gap-3 px-3 py-2"><div className="min-w-0"><h2 className="truncate text-xs font-medium text-[#202124]">{item.title}</h2><time className="text-[10px] text-[#858A91]">{formatDate(item.createdAt)} · {item.images.length} image{item.images.length === 1 ? "" : "s"}</time></div><button type="button" disabled={isMutating} aria-label={`Delete ${item.title}`} onClick={() => setItemToDelete(item)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFF0EF] text-[#FF4D4F] hover:bg-[#FFD9D6] disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div>
              </article>
            ))}
          </div>
        ) : <div className="rounded-[8px] bg-white px-6 py-14 text-center text-sm text-[#667085]">{search ? "No matching gallery items found on this page." : "No gallery items found. Add your first images to get started."}</div>}

        {!isLoading && !galleryQuery.isError && totalPages > 1 && <div className="mt-6 flex items-center justify-between rounded-[7px] bg-white px-4 py-3"><p className="text-xs text-[#667085]">Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}</p><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1 || galleryQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="text-xs font-medium">Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page >= totalPages || galleryQuery.isFetching} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>}
      </section>

      <Dialog open={isFormOpen} onOpenChange={(open) => open ? setIsFormOpen(true) : !saveMutation.isPending && closeFormModal()}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-32px)] max-w-[560px] overflow-y-auto gap-0 rounded-[12px] border-0 bg-white p-0 shadow-xl">
          <form onSubmit={saveGallery}>
            <DialogHeader className="px-5 pb-4 pt-5 text-left"><DialogTitle className="text-[20px] font-semibold text-[#263B4A]">{editingItem ? "Edit Gallery" : "Add New Gallery"}</DialogTitle><DialogDescription className="sr-only">Add or update a gallery title and images.</DialogDescription></DialogHeader>
            <div className="space-y-4 px-5">
              <label className="block space-y-1.5 text-xs font-medium text-[#344054]"><span>Title</span><input autoFocus required maxLength={150} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter Gallery Title" className="h-9 w-full rounded border border-[#C6CAD0] px-3 text-sm font-normal outline-none focus:border-[#30347F]" /></label>

              {editingItem?.images.length ? <div className="space-y-2"><p className="text-xs font-medium text-[#344054]">Current images <span className="font-normal text-[#667085]">(click to remove or undo)</span></p><div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{editingItem.images.map((image) => { const removed = removedImageIds.includes(image.publicId); return <button key={image.publicId} type="button" onClick={() => toggleExistingImage(image.publicId)} className={`relative aspect-square overflow-hidden rounded-md border-2 ${removed ? "border-red-500 opacity-50" : "border-transparent"}`}><Image src={image.url} alt="Existing gallery image" fill className="object-cover" />{removed && <span className="absolute inset-0 flex items-center justify-center bg-red-900/30 text-[10px] font-semibold text-white">Remove</span>}</button>; })}</div></div> : null}

              {newImages.length ? <div className="space-y-2"><p className="text-xs font-medium text-[#344054]">New images</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{newImages.map((image, index) => <div key={`${image.file.name}-${index}`} className="relative aspect-square overflow-hidden rounded-md"><Image src={image.preview} alt="New gallery preview" fill unoptimized className="object-cover" /><button type="button" aria-label="Remove selected image" onClick={() => removeNewImage(index)} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"><X className="h-3 w-3" /></button></div>)}</div></div> : null}

              <div><input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} /><button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-[5px] border border-dashed border-[#D0D5DD] text-xs text-[#667085] hover:border-[#30347F] hover:bg-[#FAFAFF]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E7EFF8] text-[#5575A5]"><Upload className="h-4 w-4" /></span>Select images (up to 10, max 5 MB each)</button></div>
            </div>
            <DialogFooter className="grid grid-cols-2 gap-2 px-5 pb-4 pt-5 sm:space-x-0"><button type="button" disabled={saveMutation.isPending} onClick={closeFormModal} className="h-9 rounded border border-[#30347F] text-xs font-medium text-[#30347F] disabled:opacity-50">Cancel</button><button type="submit" disabled={saveMutation.isPending} className="h-9 rounded bg-[#30347F] text-xs font-medium text-white disabled:opacity-60">{saveMutation.isPending ? "Saving..." : editingItem ? "Save Changes" : "Add Gallery"}</button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteModal isOpen={Boolean(itemToDelete)} onClose={() => !deleteMutation.isPending && setItemToDelete(null)} onConfirm={() => itemToDelete && !deleteMutation.isPending && deleteMutation.mutate(itemToDelete)} title={deleteMutation.isPending ? "Deleting Gallery..." : "Delete Gallery?"} desc={`This will delete ${itemToDelete?.title || "this gallery"} and all of its images.`} />
    </>
  );
}

export default MyGallery;
