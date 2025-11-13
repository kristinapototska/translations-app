import { type NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth";
import { signedPayloadJwtSchema } from "@bigcommerce/translations-auth-client";
import { setSession } from "@/lib/session";
import { dbClient } from "@/lib/db";

const buildRedirectUrl = (url: string, encodedContext: string) => {
  const [path, query = ""] = url.split("?");
  const queryParams = new URLSearchParams(`context=${encodedContext}&${query}`);

  return `${path}?${queryParams}`;
};

export async function GET(req: NextRequest) {
  const rUrl = new URL(req.nextUrl);

  const signed_payload_jwt = rUrl.searchParams.get("signed_payload_jwt");

  if (!signed_payload_jwt) {
    return new NextResponse("Missing signed_payload_jwt", { status: 401 });
  }

  const payload = await authClient.verifyBigCommerceJWT(signed_payload_jwt);
  const parsedJwt = signedPayloadJwtSchema.safeParse(payload);

  if (!parsedJwt.success) {
    return new NextResponse("JWT properties invalid", { status: 403 });
  }

  const { sub, url: path, user, owner } = parsedJwt.data;

  const storeHash = sub.split("/")[1] as string;

  await dbClient.setStoreUser({
    store_hash: storeHash,
    user,
  });

  const clientToken = await authClient.encodeSessionPayload({
    userId: user.id,
    userEmail: user.email,
    channelId: Number(payload?.channel_id) || null,
    storeHash,
    userLocale: user.locale,
  }, "6h");

  // create new searchParams preserving the existing ones but removing the signed_payload_jwt
  const newSearchParams = new URLSearchParams(rUrl.searchParams.toString());
  newSearchParams.delete("signed_payload_jwt");
  newSearchParams.delete("signed_payload");

  await setSession(clientToken);

  // Use the path from JWT if available, otherwise try redirect_path param, referer, or root
  // For app extensions, the JWT should contain the correct path, but we have fallbacks
  let redirectPath = path;
  if (!redirectPath || redirectPath === "/") {
    // First, try to get the redirect_path from query params (set by product page)
    const redirectPathParam = rUrl.searchParams.get("redirect_path");
    if (redirectPathParam) {
      redirectPath = redirectPathParam;
    } else {
      // Try to get the original path from referer header
      const referer = req.headers.get("referer");
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          redirectPath = refererUrl.pathname;
        } catch {
          // If referer parsing fails, use root
          redirectPath = "/";
        }
      } else {
        redirectPath = "/";
      }
    }
  }
  
  // Remove redirect_path from query params before redirecting
  newSearchParams.delete("redirect_path");

  const response = NextResponse.redirect(
    `${process.env.APP_ORIGIN}${buildRedirectUrl(
      redirectPath,
      `${clientToken}&${newSearchParams.toString()}`
    )}`,
    {
      status: 307,
    }
  );

  return response;
}
