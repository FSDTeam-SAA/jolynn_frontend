"use client";
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export const RichTextEditor = ({ value, onChange, onBlur }: Props) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder="Description here...."
      className="!rounded-lg"
    />
  );
};