import React, {
  useEffect,
  useState,
} from "react";
import { API_ASSET_BASE_URL } from "../config/api";

// =========================================
// IMAGE URL FIXER
// =========================================

export const resolveApiImageUrl = (
  imageUrl
) => {
  if (!imageUrl) {
    return "";
  }

  const cleanUrl =
    String(imageUrl).trim();

  const normalizeUrl = (value) => {
    try {
      return new URL(value).toString();
    } catch {
      return encodeURI(value);
    }
  };

  const buildAssetUrl = (path) => {
    const cleanPath = String(path || "").trim();

    if (!cleanPath) {
      return "";
    }

    const pathWithSlash = cleanPath.startsWith("/")
      ? cleanPath
      : `/${cleanPath}`;

    return normalizeUrl(`${API_ASSET_BASE_URL}${pathWithSlash}`);
  };

  // =====================================
  // FULL URL
  // =====================================

  if (
    cleanUrl.startsWith("http://") ||
    cleanUrl.startsWith("https://")
  ) {
    return normalizeUrl(cleanUrl);
  }

  // =====================================
  // RELATIVE URL
  // =====================================

  if (
    cleanUrl.startsWith("/")
  ) {
    return buildAssetUrl(cleanUrl);
  }

  // =====================================
  // DEFAULT
  // =====================================

  return buildAssetUrl(cleanUrl);
};

// =========================================
// COMPONENT
// =========================================

function AuthImage({
  src,
  alt,
  className,
  style,
  fallback,
}) {
  const [failed, setFailed] =
    useState(false);

  const imageSrc =
    resolveApiImageUrl(src);

  useEffect(() => {
    setFailed(false);
  }, [imageSrc]);

  // =====================================
  // FALLBACK
  // =====================================

  if (!imageSrc || failed) {
    return fallback || null;
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        console.log(
          "Image failed:",
          imageSrc
        );

        setFailed(true);
      }}
    />
  );
}

export default AuthImage;
