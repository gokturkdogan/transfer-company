import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const cloudinaryCloudName =
  process.env.CLOUDINARY_CLOUD_NAME?.trim() || "pdyhhkjq";

const pdfAssetIncludes = [
  "./node_modules/dejavu-fonts-ttf/ttf/**/*.ttf",
  "./public/images/brand/logo-emblem.png",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfmake", "dejavu-fonts-ttf"],
  outputFileTracingIncludes: {
    "/admin/dashboard-report": pdfAssetIncludes,
    "/admin/reservations/[id]/report": pdfAssetIncludes,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${cloudinaryCloudName}/image/upload/**`,
      },
    ],
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
