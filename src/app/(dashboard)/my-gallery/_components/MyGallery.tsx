"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import { Plus, Search, Trash2, Upload } from "lucide-react";
import DeleteModal from "@/components/modals/delete-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GalleryItem = {
  id: number;
  title: string; 
  image: string;
  createdAt: string;
};

const initialGallery: GalleryItem[] = [
  {
    id: 1,
    title: "House Wiring Project",
    image: "/assets/images/jobs-post.jpg",
    createdAt: "2 days ago",
  },
  {
    id: 2,
    title: "Electrical Panel Upgrade",
    image: "/assets/images/contact-hero.jpg",
    createdAt: "2 days ago",
  },
  {
    id: 3,
    title: "Outdoor Security Lighting",
    image: "/assets/images/about_hero.jpg",
    createdAt: "2 days ago",
  },
  {
    id: 4,
    title: "Office Lighting Upgrade",
    image: "/assets/images/report-hero.jpg",
    createdAt: "2 days ago",
  },
];

function MyGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredGallery = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return gallery;
    return gallery.filter((item) => item.title.toLowerCase().includes(query));
  }, [gallery, search]);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setImage("");
    setIsFormOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setImage(item.image);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setTitle("");
    setImage("");
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const saveImage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !image) return;

    if (editingItem) {
      setGallery((current) =>
        current.map((item) =>
          item.id === editingItem.id
            ? { ...item, title: trimmedTitle, image }
            : item,
        ),
      );
    } else {
      setGallery((current) => [
        ...current,
        {
          id: Date.now(),
          title: trimmedTitle,
          image,
          createdAt: "Just now",
        },
      ]);
    }

    closeFormModal();
  };

  const deleteImage = () => {
    if (!itemToDelete) return;
    setGallery((current) =>
      current.filter((item) => item.id !== itemToDelete.id),
    );
    setItemToDelete(null);
  };

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    item: GalleryItem,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEditModal(item);
    }
  };

  return (
    <>
      <section>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-[340px]">
            <span className="sr-only">Search gallery</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="h-[36px] w-full rounded-[8px] border-0 bg-[#EAECED] pl-9 pr-4 text-xs text-[#344054] outline-none placeholder:text-[#667085] focus:ring-2 focus:ring-[#30347F]/20"
            />
          </label>

          <button
            type="button"
            onClick={openAddModal}
            className="flex h-[36px] cursor-pointer items-center justify-center gap-2 rounded-[5px] bg-[#30347F] px-5 text-xs font-medium text-white transition-colors hover:bg-[#252966]"
          >
            <Plus className="h-4 w-4" />
            Add Image
          </button>
        </div>

        {filteredGallery.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredGallery.map((item) => (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Edit ${item.title}`}
                onClick={() => openEditModal(item)}
                onKeyDown={(event) => handleCardKeyDown(event, item)}
                className="group cursor-pointer overflow-hidden rounded-[7px] bg-white outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#30347F]"
              >
                <div className="relative aspect-[1.6/1] w-full overflow-hidden bg-[#EAECF0]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    unoptimized={item.image.startsWith("data:")}
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <button
                    type="button"
                    aria-label={`Delete ${item.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setItemToDelete(item);
                    }}
                    className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#FFF0EF] text-[#FF4D4F] shadow-sm transition-colors hover:bg-[#FFD9D6]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 px-3 py-2">
                  <h2 className="truncate text-xs font-medium text-[#202124]">
                    {item.title}
                  </h2>
                  <time className="shrink-0 text-[10px] text-[#858A91]">
                    {item.createdAt}
                  </time>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] bg-white px-6 py-14 text-center text-sm text-[#667085]">
            No images found.
          </div>
        )}
      </section>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => (open ? setIsFormOpen(true) : closeFormModal())}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-[370px] gap-0 rounded-[12px] border-0 bg-white p-0 shadow-xl [&>button]:right-0 [&>button]:top-0 [&>button]:flex [&>button]:h-8 [&>button]:w-8 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-none [&>button]:rounded-bl-[7px] [&>button]:bg-[#30347F] [&>button]:text-white [&>button]:opacity-100 [&>button_svg]:h-4 [&>button_svg]:w-4">
          <form onSubmit={saveImage}>
            <DialogHeader className="px-4 pb-4 pt-4 text-left">
              <DialogTitle className="text-[20px] font-semibold leading-7 text-[#263B4A]">
                {editingItem ? "Edit Image" : "Add New Image"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {editingItem
                  ? "Update the gallery image title or uploaded image."
                  : "Add a title and upload a new gallery image."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 px-4">
              <label className="block space-y-1.5 text-[11px] font-medium text-[#344054]">
                <span>Title</span>
                <input
                  autoFocus
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter Image Title"
                  className="h-[30px] w-full rounded-[2px] border border-[#C6CAD0] px-2 text-xs font-normal text-[#344054] outline-none placeholder:text-[#B0B5BD] focus:border-[#30347F] focus:ring-1 focus:ring-[#30347F]"
                />
              </label>

              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-[#344054]">Image</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex h-[114px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[5px] border border-dashed border-[#D0D5DD] bg-white transition-colors hover:border-[#30347F] hover:bg-[#FAFAFF]"
                >
                  {image ? (
                    <>
                      <Image
                        src={image}
                        alt="Selected gallery preview"
                        fill
                        unoptimized={image.startsWith("data:")}
                        className="object-cover"
                      />
                      <span className="absolute inset-0 bg-black/20" />
                      <span className="relative rounded bg-white/90 px-3 py-1 text-[10px] font-medium text-[#30347F]">
                        Change image
                      </span>
                    </>
                  ) : (
                    <span className="flex flex-col items-center gap-2 text-[10px] text-[#B0B5BD]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E7EFF8] text-[#5575A5]">
                        <Upload className="h-4 w-4" />
                      </span>
                      Upload Cover Image (JPG, PNG)
                    </span>
                  )}
                </button>
              </div>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-1.5 px-4 pb-3 pt-4 sm:space-x-0">
              <button
                type="button"
                onClick={closeFormModal}
                className="h-[29px] cursor-pointer rounded-[4px] border border-[#30347F] text-[10px] font-medium text-[#30347F] transition-colors hover:bg-[#F3F4FA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[29px] cursor-pointer rounded-[4px] bg-[#30347F] text-[10px] font-medium text-white transition-colors hover:bg-[#252966]"
              >
                {editingItem ? "Save Changes" : "Add Image"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={deleteImage}
        title="Delete Image?"
        desc={`Are you sure you want to delete ${itemToDelete?.title || "this image"}?`}
      />
    </>
  );
}

export default MyGallery;
