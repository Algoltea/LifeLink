"use client";

import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { CameraIcon, ImageIcon, LightbulbIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";

import { currentMessages, useMessages } from "@/i18n/locale";

const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

const photoError = (file: File): string | null => {
  const t = currentMessages().photoInput;

  if (!PHOTO_TYPES.has(file.type)) {
    return t.wrongType;
  }

  if (file.size === 0 || file.size > MAX_PHOTO_BYTES) {
    return t.tooLarge;
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
  const t = useMessages().photoInput;

  useEffect(() => {
    const capture = captureRef.current;

    const cancelled = () => setError(currentMessages().photoInput.noPhotoTaken);

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
      setError(t.cameraFallback);

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
        setError(t.cameraFailed);
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
      setError(t.cannotTake);

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
          setError(t.cannotTake);

          return;
        }

        choose(new File([blob], t.fileName, { type: blob.type }));
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <input
        accept={PHOTO_ACCEPT}
        aria-label={t.chooseAria}
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
        aria-label={t.takeAria}
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
            aria-label={t.cameraAria}
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
              {t.takeThis}
            </Button>
            <Button onClick={closeCamera} type="button" variant="outline">
              {t.cancelCamera}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Button
              aria-describedby={guidanceId}
              className={cn(
                "flex-1 basis-36 gap-1.5 px-2",
                dragging && "border-primary bg-neutral-wash"
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
                  setError(t.oneAtATime);

                  return;
                }

                choose(event.dataTransfer.files[0]);
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              <ImageIcon aria-hidden="true" />
              {file ? t.change : t.choose}
            </Button>
            <Button
              aria-busy={cameraPending}
              className="flex-1 basis-36 gap-1.5 px-2"
              disabled={disabled || cameraPending}
              onClick={openCamera}
              size="sm"
              type="button"
              variant="outline"
            >
              <CameraIcon aria-hidden="true" />
              {cameraPending ? t.opening : t.take}
            </Button>
          </div>
          {file && preview ? (
            <div className="bg-parchment relative h-59 overflow-hidden rounded-xl">
              <Image
                alt={t.previewAlt}
                className="object-contain"
                fill
                onError={() => {
                  setError(t.cannotOpen);
                  onFile(null);
                }}
                sizes="(max-width: 768px) 100vw, 700px"
                src={preview}
                unoptimized
              />
            </div>
          ) : null}
        </div>
      )}

      {file ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-label min-w-0 break-all">{file.name}</p>
          <Button
            disabled={disabled}
            onClick={() => onFile(null)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <XIcon aria-hidden="true" />
            {t.remove}
          </Button>
        </div>
      ) : null}
      <p className="text-label flex items-start gap-2" id={guidanceId}>
        <LightbulbIcon aria-hidden="true" className="mt-1 size-4 shrink-0" />
        {t.guidance}
      </p>
      {error ? (
        <p className="text-negative text-lg" role="alert">
          {error}
        </p>
      ) : null}
      {cameraPending ? (
        <Button onClick={closeCamera} type="button" variant="ghost">
          {t.cancelCamera}
        </Button>
      ) : null}
    </div>
  );
};

export { PhotoInput, photoError };
