"use client";

import { useEffect, useRef, useCallback } from "react";

export default function Html5QrcodePlugin({
  fps = 15,
  qrbox = 300,
  aspectRatio = 1.0,
  disableFlip = false,
  onSuccess,
  onError,
  onReady,
}) {
  const elementId = "html5-qr-reader";
  const scannerRef = useRef(null);
  const hasInitialized = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);

  // Keep refs updated to avoid re-renders restarting the scanner
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
  }, [onSuccess, onError, onReady]);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    let isMounted = true;

    const initializeScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!isMounted) return;

        const html5QrCode = new Html5Qrcode(elementId, /* verbose= */ false);
        scannerRef.current = html5QrCode;

        // Try to get cameras first
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          console.error("No cameras found");
          return;
        }

        console.log(
          "Available cameras:",
          cameras.map((c) => c.label),
        );

        // Prefer back camera
        let cameraId = cameras[0].id;
        const backCamera = cameras.find(
          (cam) =>
            cam.label.toLowerCase().includes("back") ||
            cam.label.toLowerCase().includes("rear") ||
            cam.label.toLowerCase().includes("environment"),
        );
        if (backCamera) {
          cameraId = backCamera.id;
        }

        const config = {
          fps,
          qrbox: { width: qrbox, height: qrbox },
          aspectRatio,
          disableFlip,
        };

        await html5QrCode.start(
          cameraId,
          config,
          (decodedText) => {
            console.log("[QR] Decoded:", decodedText);
            if (onSuccessRef.current) {
              onSuccessRef.current(decodedText);
            }
          },
          (errorMessage) => {
            // Suppress continuous "no QR found" messages
          },
        );

        hasInitialized.current = true;
        console.log("[QR] Scanner started successfully");

        if (onReadyRef.current) {
          onReadyRef.current();
        }
      } catch (error) {
        console.error("[QR] Initialization error:", error);

        // Fallback: try with facingMode constraint instead of cameraId
        try {
          const { Html5Qrcode } = await import("html5-qrcode");

          if (!isMounted || !scannerRef.current) {
            const html5QrCode = new Html5Qrcode(elementId, false);
            scannerRef.current = html5QrCode;
          }

          // Use facingMode constraint as fallback
          await scannerRef.current.start(
            { facingMode: "environment" },
            {
              fps,
              qrbox: { width: qrbox, height: qrbox },
              aspectRatio,
              disableFlip,
            },
            (decodedText) => {
              console.log("[QR] Decoded (fallback):", decodedText);
              if (onSuccessRef.current) {
                onSuccessRef.current(decodedText);
              }
            },
            () => {},
          );

          hasInitialized.current = true;
          console.log("[QR] Scanner started (fallback mode)");

          if (onReadyRef.current) {
            onReadyRef.current();
          }
        } catch (fallbackError) {
          console.error("[QR] Fallback also failed:", fallbackError);
        }
      }
    };

    // Small delay to ensure DOM element exists
    const timeoutId = setTimeout(initializeScanner, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);

      if (scannerRef.current && hasInitialized.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear();
            console.log("[QR] Scanner stopped and cleaned up");
          })
          .catch((err) => {
            console.log("[QR] Cleanup error (safe to ignore):", err);
          });
      }
      hasInitialized.current = false;
    };
  }, []); // Empty deps - only init once

  return (
    <div
      id={elementId}
      style={{
        width: "100%",
        minHeight: "300px",
      }}
    />
  );
}
