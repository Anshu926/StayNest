"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Plus, Sparkles, Image as ImageIcon, Check } from "lucide-react";

interface ImageUploadSectionProps {
  images: string[];
  onChange: (images: string[]) => void;
  listingType?: string;
}

const SAMPLE_ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&q=80",
  "https://images.unsplash.com/photo-1536858974309-969e2d7f91ee?w=800&q=80",
];

const SAMPLE_TIFFIN_IMAGES = [
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
  "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?w=800&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
];

export default function ImageUploadSection({
  images,
  onChange,
  listingType,
}: ImageUploadSectionProps) {
  // Ensure we have 4 slots (pad with empty strings if needed)
  const slots: string[] = [
    images[0] || "",
    images[1] || "",
    images[2] || "",
    images[3] || "",
  ];

  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [urlInputs, setUrlInputs] = useState<string[]>(slots);

  const handleUpdateSlot = (index: number, value: string) => {
    const updated = [...slots];
    updated[index] = value.trim();
    const cleanList = updated.filter(Boolean);
    onChange(cleanList);

    const updatedInputs = [...urlInputs];
    updatedInputs[index] = value;
    setUrlInputs(updatedInputs);
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (under 4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert("Please select an image smaller than 4MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        handleUpdateSlot(index, base64Url);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSlot = (index: number) => {
    const updated = [...slots];
    updated[index] = "";
    // compact remaining images forward
    const compacted = updated.filter(Boolean);
    while (compacted.length < 4) compacted.push("");
    onChange(compacted.filter(Boolean));
    setUrlInputs(compacted);
  };

  const handleSetCover = (index: number) => {
    if (index === 0 || !slots[index]) return;
    const item = slots[index];
    const rest = slots.filter((_, i) => i !== index && Boolean(slots[i]));
    const updated = [item, ...rest];
    while (updated.length < 4) updated.push("");
    onChange(updated.filter(Boolean));
    setUrlInputs(updated);
    setActiveSlot(0);
  };

  const loadSamplePresets = () => {
    const samples = listingType === "tiffin" ? SAMPLE_TIFFIN_IMAGES : SAMPLE_ROOM_IMAGES.slice(0, 4);
    onChange(samples);
    setUrlInputs(samples);
  };

  const samplePool = listingType === "tiffin" ? SAMPLE_TIFFIN_IMAGES : SAMPLE_ROOM_IMAGES;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white">
            Property Photos (4 Images) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Add 1 main cover photo and 3 gallery photos for your listing.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSamplePresets}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/60 px-3 py-1.5 rounded-lg transition-colors border border-primary-200 dark:border-primary-900"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Use Demo Photos
        </button>
      </div>

      {/* 4-Image Live Visual Gallery Preview (1 Large + 3 Stacked Layout) */}
      <div className="bg-gray-950 p-3 rounded-2xl shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 h-72 md:h-80 rounded-xl overflow-hidden">
          
          {/* Main Large Photo (Slot 0) */}
          <div
            onClick={() => setActiveSlot(0)}
            className={`relative md:col-span-3 rounded-xl overflow-hidden bg-gray-900 border-2 cursor-pointer transition-all ${
              activeSlot === 0 ? "border-primary-500 ring-2 ring-primary-500/30" : "border-gray-800 hover:border-gray-700"
            }`}
          >
            {slots[0] ? (
              <>
                <Image
                  src={slots[0]}
                  alt="Main Cover Photo"
                  fill
                  className="object-cover"
                  unoptimized={slots[0].startsWith("data:")}
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Cover Photo (Main)
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSlot(0);
                  }}
                  className="absolute top-3 right-3 w-7 h-7 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-200">Main Cover Photo</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Click to upload or enter image URL below
                </p>
              </div>
            )}
          </div>

          {/* 3 Stacked Side Thumbnails (Slots 1, 2, 3) */}
          <div className="hidden md:flex flex-col gap-2">
            {[1, 2, 3].map((slotIdx) => (
              <div
                key={slotIdx}
                onClick={() => setActiveSlot(slotIdx)}
                className={`relative flex-1 rounded-xl overflow-hidden bg-gray-900 border-2 cursor-pointer transition-all group ${
                  activeSlot === slotIdx
                    ? "border-primary-500 ring-2 ring-primary-500/30"
                    : "border-gray-800 hover:border-gray-700"
                }`}
              >
                {slots[slotIdx] ? (
                  <>
                    <Image
                      src={slots[slotIdx]}
                      alt={`Photo ${slotIdx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={slots[slotIdx].startsWith("data:")}
                    />
                    <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                      #{slotIdx + 1}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCover(slotIdx);
                        }}
                        className="bg-primary-500 hover:bg-primary-600 text-white text-[11px] font-medium px-2 py-1 rounded shadow"
                        title="Make Main Cover"
                      >
                        Set Main
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSlot(slotIdx);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white p-1 rounded shadow"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-2 text-center">
                    <Plus className="w-5 h-5 mb-1 text-gray-500 group-hover:text-primary-400 transition-colors" />
                    <span className="text-[11px] font-medium">Photo {slotIdx + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Image Input Controls Tabs/Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((idx) => {
          const isCover = idx === 0;
          const hasImage = Boolean(slots[idx]);
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                activeSlot === idx
                  ? "border-primary-400 bg-primary-50/20 dark:bg-primary-950/40 shadow-sm"
                  : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  {isCover ? "Main Cover Photo (Required)" : `Gallery Photo ${idx + 1}`}
                </span>
                {hasImage && (
                  <span className="text-[11px] text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> Added
                  </span>
                )}
              </div>

              {/* Paste URL Input */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="url"
                    placeholder="Paste image URL (https://...)"
                    value={urlInputs[idx] || ""}
                    onChange={(e) => handleUpdateSlot(idx, e.target.value)}
                    onFocus={() => setActiveSlot(idx)}
                    className="input-field pr-16 text-xs font-mono"
                  />
                  {slots[idx] && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(idx)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-500 hover:text-red-700 px-1.5 py-0.5 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Upload File button */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-700 dark:text-slate-300 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                    <span>Upload from device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(idx, e)}
                    />
                  </label>
                  {!isCover && hasImage && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(idx)}
                      className="px-2.5 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 hover:text-primary-600 dark:hover:text-primary-400 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-600 dark:text-slate-300 transition-colors"
                      title="Set as main cover"
                    >
                      Set Main
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Select Preset Images Bar */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">
          Or pick from recommended high-quality images:
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {samplePool.map((sampleUrl, sIdx) => {
            const isAlreadyAdded = slots.includes(sampleUrl);
            return (
              <button
                key={sIdx}
                type="button"
                onClick={() => {
                  handleUpdateSlot(activeSlot, sampleUrl);
                  // advance active slot if empty
                  const nextEmpty = slots.findIndex((s, i) => i !== activeSlot && !s);
                  if (nextEmpty !== -1) setActiveSlot(nextEmpty);
                }}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-transform hover:scale-105 ${
                  isAlreadyAdded ? "border-green-500 opacity-60" : "border-gray-200 dark:border-slate-700 hover:border-primary-500"
                }`}
              >
                <Image src={sampleUrl} alt={`Sample ${sIdx + 1}`} fill className="object-cover" />
                {isAlreadyAdded && (
                  <div className="absolute inset-0 bg-green-900/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
