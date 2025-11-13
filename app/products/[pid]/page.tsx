"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import ErrorMessage from "@/components/error-message";
import ProductForm from "@/components/product-form";
import { LoadingScreen } from "@/components/loading-indicator";
import { useHasMounted } from "@/hooks/useMounted";
import { useChannels } from "@/hooks/useChannels";
import { Suspense } from "react";

function ProductInfoContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasMounted = useHasMounted();
  const context = searchParams?.get("context");
  const signedPayloadJwt = searchParams?.get("signed_payload_jwt");

  // Handle app extension authentication: if context is missing but signed_payload_jwt is present,
  // redirect to /api/load to process the JWT and get the context token
  useEffect(() => {
    if (!context && signedPayloadJwt) {
      // Redirect to /api/load which will process the JWT and redirect back with context
      const currentUrl = new URL(window.location.href);
      const loadUrl = new URL("/api/load", window.location.origin);
      loadUrl.searchParams.set("signed_payload_jwt", signedPayloadJwt);
      // Pass the current pathname so /api/load knows where to redirect back to
      loadUrl.searchParams.set("redirect_path", currentUrl.pathname);
      // Preserve any other query parameters (except signed_payload_jwt and context)
      currentUrl.searchParams.forEach((value, key) => {
        if (key !== "signed_payload_jwt" && key !== "context") {
          loadUrl.searchParams.set(key, value);
        }
      });
      router.replace(loadUrl.toString());
      return;
    }
  }, [context, signedPayloadJwt, router]);

  // Show loading while redirecting
  if (!context && signedPayloadJwt) {
    return <>{hasMounted ? <LoadingScreen /> : null}</>;
  }

  // Show error if neither context nor signed_payload_jwt is present
  if (!context && !signedPayloadJwt) {
    return <ErrorMessage />;
  }

  const {
    channels,
    isLoading: isChannelsInfoLoading,
    error: hasChannelsInfoLoadingError,
  } = useChannels(context ?? null);

  if (hasChannelsInfoLoadingError) return <ErrorMessage />;

  if (isChannelsInfoLoading)
    return <>{hasMounted ? <LoadingScreen /> : null}</>;

  return (
    <ProductForm
      channels={channels ?? []}
      productId={Number(params?.pid || 0)}
      context={context || ""}
    />
  );
}

export default function ProductInfo() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ProductInfoContent />
    </Suspense>
  );
}
