import React, { useMemo, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { ImageWithPreview } from "../components/ImageLightbox.jsx";
import { addFoundItem } from "../lib/api.js";

const CATEGORIES = ["Electronics", "ID Cards", "Books", "Clothing", "Accessories", "Other"];

const LOCATION_OPTIONS = [
  "Other",
  "Academic block front",
  "Cafegram",
  "PU canteen",
  "Cafe behind canteen",
  "Boys hostel front",
  "Mess front",
  "American football ground",
  "Basketball court",
  "Tennis court",
  "Library",
];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function ReportFound() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(LOCATION_OPTIONS[0]);
  const [locationOtherText, setLocationOtherText] = useState("");
  const [locationSupportingText, setLocationSupportingText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const isOtherLocation = location === "Other";
  const canSubmit = useMemo(() => {
    const base = name.trim() && category.trim() && description.trim();
    if (!base) return false;
    if (isOtherLocation) return locationOtherText.trim().length > 0;
    return true;
  }, [name, category, description, isOtherLocation, locationOtherText]);

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }
    setImageFile(file);
    try {
      const dataUrl = await fileToDataUrl(file);
      setImagePreview(typeof dataUrl === "string" ? dataUrl : "");
    } catch {
      setImagePreview("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAlert({ type: "", message: "" });
    if (!canSubmit) {
      setAlert({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    setSubmitting(true);
    try {
      let image = "";
      if (imageFile) {
        const dataUrl = await fileToDataUrl(imageFile);
        image = typeof dataUrl === "string" ? dataUrl : "";
      }

      await addFoundItem({
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        image: image || undefined,
        location: location.trim(),
        locationOtherText: isOtherLocation ? locationOtherText.trim() : "",
        locationSupportingText: locationSupportingText.trim() || undefined,
      });

      setAlert({
        type: "success",
        message: "Found item reported. After admin approval it will appear for others to claim.",
      });
      setName("");
      setCategory(CATEGORIES[0]);
      setDescription("");
      setLocation(LOCATION_OPTIONS[0]);
      setLocationOtherText("");
      setLocationSupportingText("");
      setImageFile(null);
      setImagePreview("");
    } catch (err) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || "Failed to submit report.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Report Found Item</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Share details of the item you found so the owner can recognise and claim it.
        </p>
      </div>

      {alert.message ? (
        <div
          className={[
            "rounded-2xl border p-4 text-sm",
            alert.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200",
          ].join(" ")}
        >
          {alert.message}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Found Item name <span className="text-rose-500">*</span>
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-slate-200 focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
              placeholder="e.g., Smartphone"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Category <span className="text-rose-500">*</span>
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-slate-200 focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Description <span className="text-rose-500">*</span>
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-slate-200 focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
            placeholder="Where did you find this item? Tell us about it."
          />
        </label>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Found at <span className="text-rose-500">*</span>
            </span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-slate-200 focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
            >
              {LOCATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          {isOtherLocation ? (
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Specify location <span className="text-rose-500">*</span>
              </span>
              <input
                value={locationOtherText}
                onChange={(e) => setLocationOtherText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-slate-200 focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
                placeholder="Enter the place name"
              />
            </label>
          ) : null}
        </div>

        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Supporting details (optional)</span>
          <input
            value={locationSupportingText}
            onChange={(e) => setLocationSupportingText(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-slate-200 focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
            placeholder="e.g. near the stairs, under bench"
          />
        </label>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Image upload (optional)</span>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800 dark:text-slate-300 dark:file:bg-white dark:file:text-slate-900 dark:hover:file:bg-slate-100"
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              This demo stores the image as a string (data URL). Keep uploads small.
            </div>
          </label>

          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <ImagePlus size={16} />
              Preview
            </div>
            <div className="mt-3 h-40 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-950">
              {imagePreview ? (
                <ImageWithPreview src={imagePreview} alt="Upload preview" className="cursor-zoom-in" />
              ) : (
                <div className="grid h-full place-items-center text-xs text-slate-500 dark:text-slate-400">
                  No image selected
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
            Submit Report
          </button>
        </div>
      </form>
    </section>
  );
}

