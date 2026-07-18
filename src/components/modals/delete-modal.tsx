import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  desc: string;
};

const DeleteModal = ({ isOpen, onClose, onConfirm, title, desc }: DeleteModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] bg-white !rounded-[12px]">
        <DialogHeader className="">
          <DialogTitle className="text-xl md:text-2xl font-semibold leading-normal text-black text-center">{title}</DialogTitle>
          <DialogDescription className="text-base font-medium text-black leading-normal text-center pt-1">
            {desc}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="w-full grid grid-cols-2 gap-5 mt-3">
          <div className="col-span-1">
            <button
              className="w-full h-[44px] text-base font-medium bg-transparent hover:bg-primary text-primary hover:text-white border border-primary leading-normal py-[10px] px-5 rounded-[10px]"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
          <div className="col-span-1">
            <button
              className="w-full h-[44px] flex items-center justify-center gap-2 text-white bg-primary hover:bg-[#FF0000]/80 border border-primary hover:border-[#FF0000] py-[10px] px-6 text-base font-medium leading-[120%] rounded-[8px]"
              onClick={onConfirm}
            >
             <Trash2 className="w-5 h-5 text-white"/> Delete
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
