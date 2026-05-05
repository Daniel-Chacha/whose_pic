import { Uploader } from "@/components/Uploader";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Upload a photo</h1>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        We'll detect faces and let you label them. JPEG, PNG, or WebP, up to 10 MB.
      </p>
      <Uploader />
    </div>
  );
}
