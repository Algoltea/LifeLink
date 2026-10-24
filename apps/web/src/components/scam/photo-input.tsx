"use client";

import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { CameraIcon, ImageIcon, LightbulbIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";

const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

const photoError = (file: File): string | null => {
  if (!PHOTO_TYPES.has(file.type)) {
    return "Choose a JPEG, PNG or WebP photo. You can also type the words instead.";
  }

  if (file.size === 0 || file.size > MAX_PHOTO_BYTES) {
    return "Choose a photo up to 6 MB. This photo is empty or too large.";
  }

  return null;
};

const stopCamera = (stream: MediaStream | null) => {
  for (const track of stream?.getTracks() ?? []) {
    track.stop();
  }
};

/** Camera and file selection stay on the device until the person checks the photo. */
const PhotoInput = ({
  active,
  disabled,
  file,
  onFile,
}: {
  active: boolean;
  disabled: boolean;
  file: File | null;
  onFile: (file: File | null) => void;
}) => {
  const chooserRef = useRef<HTMLInputElement>(null);
  const captureRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRequest = useRef(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraPending, setCameraPending] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const guidanceId = useId();

  useEffect(() => {
    const capture = captureRef.current;

    const cancelled = () =>
      setError(
        "No photo was taken. You can try again or choose from photos below."
      );

    capture?.addEventListener("cancel", cancelled);

    return () => capture?.removeEventListener("cancel", cancelled);
  }, []);

  useEffect(
    () => () => {
      if (preview !== null) {
        URL.revokeObjectURL(preview);
      }
    },
    [preview]
  );

  useEffect(() => {
    if (cameraOpen && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOpen]);

  useEffect(
    () => () => {
      cameraRequest.current += 1;
      stopCamera(streamRef.current);
    },
    []
  );

  const closeCamera = () => {
    cameraRequest.current += 1;
    stopCamera(streamRef.current);
    streamRef.current = null;
    setCameraOpen(false);
    setCameraPending(false);
    setCameraReady(false);
  };

  const suspendCamera = useEffectEvent(closeCamera);
  // Stop the external browser camera and synchronize its controls when this workspace is hidden.
  /* oxlint-disable react/set-state-in-effect */
  useEffect(() => {
    if (!active) {
      suspendCamera();
    }
  }, [active]);
  /* oxlint-enable react/set-state-in-effect */

  const choose = (next: File | undefined) => {
    if (disabled || next === undefined) {
      return;
    }

    closeCamera();
    const problem = photoError(next);
    setError(problem);
    setPreview(problem === null ? URL.createObjectURL(next) : null);
    onFile(problem === null ? next : null);
  };

  const openCamera = async () => {
    setError(null);
    setPreview(null);
    onFile(null);

    // Mobile browsers provide a native rear-camera flow through capture.
    if (
      captureRef.current &&
      "capture" in captureRef.current &&
      globalThis.matchMedia("(pointer: coarse)").matches
    ) {
      captureRef.current.click();

      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      captureRef.current?.click();
      setError(
        "If the camera doesn’t open, choose a photo you’ve already taken below."
      );

      return;
    }

    cameraRequest.current += 1;
    const request = cameraRequest.current;
    setCameraPending(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });

      if (cameraRequest.current !== request) {
        stopCamera(stream);

        return;
      }

      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      if (cameraRequest.current === request) {
        setError(
          "The camera couldn’t open. Allow camera access in your browser, or choose a photo you’ve already taken below."
        );
      }
    }

    if (cameraRequest.current === request) {
      setCameraPending(false);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;

    if (!video || !cameraReady || video.videoWidth === 0) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      closeCamera();
      setError("The photo couldn’t be taken. Choose a photo below instead.");

      return;
    }

    context.drawImage(video, 0, 0);
    const request = cameraRequest.current;
    canvas.toBlob(
      (blob) => {
        if (request !== cameraRequest.current) {
          return;
        }

        if (blob === null) {
          closeCamera();
          setError(
            "The photo couldn’t be taken. Choose a photo below instead."
          );

          return;
        }

        choose(
          new File([blob], "Photo of your message.jpg", { type: blob.type })
        );
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <input
        accept={PHOTO_ACCEPT}
        aria-label="Choose a photo or screenshot"
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          choose(event.target.files?.[0]);
          event.target.value = "";
        }}
        ref={chooserRef}
        type="file"
      />
      <input
        accept="image/*"
        aria-label="Take a photo with your camera"
        capture="environment"
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          choose(event.target.files?.[0]);
          event.target.value = "";
        }}
        ref={captureRef}
        type="file"
      />

      {cameraOpen ? (
        <div className="flex flex-col gap-3">
          <video
            aria-label="Camera preview of your message"
            autoPlay
            className="bg-parchment h-59 w-full rounded-xl object-contain"
            muted
            onCanPlay={() => setCameraReady(true)}
            playsInline
            ref={videoRef}
          />
          <div className="flex flex-wrap gap-3">
            <Button disabled={!cameraReady} onClick={takePhoto} type="button">
              <CameraIcon aria-hidden="true" />
              Take this photo
            </Button>
            <Button onClick={closeCamera} type="button" variant="outline">
              Cancel camera
            </Button>
          </div>
        </div>
      ) : (
        <button
          aria-describedby={guidanceId}
          aria-label={
            file
              ? "Choose a different photo"
              : "Choose or drop a photo of your message"
          }
          className={cn(
            "border-control bg-parchment hover:border-primary relative flex min-h-55 w-full flex-col items-center justify-center gap-3.5 overflow-hidden rounded-2xl border-2 border-dashed p-7 text-center disabled:cursor-not-allowed",
            dragging && "border-primary bg-neutral-wash",
            file && preview && "h-59 p-0"
          )}
          disabled={disabled}
          onClick={() => chooserRef.current?.click()}
          onDragLeave={() => setDragging(false)}
          onDragOver={(event) => {
            event.preventDefault();

            if (!disabled) {
              setDragging(true);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);

            if (event.dataTransfer.files.length > 1) {
              setError(
                "Choose one photo at a time so it’s clear what is being checked."
              );

              return;
            }

            choose(event.dataTransfer.files[0]);
          }}
          type="button"
        >
          {file && preview ? (
            <Image
              alt="Your selected photo, ready for you to check"
              className="object-contain"
              fill
              onError={() => {
                setError(
                  "This photo can’t be opened. Choose another JPEG, PNG or WebP photo, or type the words instead."
                );
                onFile(null);
              }}
              sizes="(max-width: 768px) 100vw, 700px"
              src={preview}
              unoptimized
            />
          ) : (
            <>
              <ImageIcon
                aria-hidden="true"
                className="text-muted-foreground size-9"
              />
              <span className="text-xl font-semibold">
                Drop a photo of a letter, a text or a website here
              </span>
              <span className="text-muted-foreground text-lg">
                JPEG, PNG or WebP · up to 6 MB
              </span>
              <span className="font-medium underline underline-offset-4">
                Choose a photo
              </span>
            </>
          )}
        </button>
      )}

      {file ? (
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 text-lg break-all">{file.name}</p>
          <Button
            disabled={disabled}
            onClick={() => onFile(null)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <XIcon aria-hidden="true" />
            Remove
          </Button>
        </div>
      ) : null}
      <p className="flex items-start gap-2.5 text-lg" id={guidanceId}>
        <LightbulbIcon aria-hidden="true" className="mt-1 size-5 shrink-0" />
        Hold the letter flat in good light, with all the words in view.
      </p>
      {error ? (
        <p className="text-negative text-lg" role="alert">
          {error}
        </p>
      ) : null}
      {cameraOpen ? null : (
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
          <Button
            aria-busy={cameraPending}
            className="min-h-15 text-lg sm:flex-1"
            disabled={disabled || cameraPending}
            onClick={openCamera}
            type="button"
            variant="outline"
          >
            <CameraIcon aria-hidden="true" />
            {cameraPending ? "Opening camera…" : "Take a photo"}
          </Button>
          <Button
            className="min-h-13 text-lg underline underline-offset-4 sm:flex-1"
            disabled={disabled}
            onClick={() => chooserRef.current?.click()}
            type="button"
            variant="ghost"
          >
            <ImageIcon aria-hidden="true" />
            Choose from photos
          </Button>
        </div>
      )}
      {cameraPending ? (
        <Button onClick={closeCamera} type="button" variant="ghost">
          Cancel camera
        </Button>
      ) : null}
    </div>
  );
};

export { PhotoInput, photoError };
