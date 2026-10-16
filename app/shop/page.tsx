import type { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop",
  description: "Pendants, chokers, lockets and more: browse every Lumi Lockets necklace.",
};

export default function ShopPage() {
  return <ShopClient />;
}
