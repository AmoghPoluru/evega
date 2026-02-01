/// <reference types="next" />
import { Poppins } from "next/font/google"
import { Navbar } from "./Navbar"
import { SearchFilter } from "./search-filter/index"
import configPromise from "@payload-config"
import { getPayload } from "payload"
import { Category } from "@/payload-types"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

interface Props {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  const payload = await getPayload({
    config: configPromise,
  })

  const categories = await payload.find({
    collection: "categories",
    depth: 2,
    limit: 100,
    where: {
      parent: {
        equals: null,
      },
    },
    sort: "name",
  })

  // Format data to include categories and subcategories details
  const formattedData = categories.docs.map((doc) => {
    // Handle both array and docs format
    const subcategories = Array.isArray(doc.subcategories)
      ? doc.subcategories
      : (doc.subcategories?.docs || []);
    
    // Filter to only Category objects (not string IDs)
    const validSubcategories = subcategories
      .filter((sub): sub is Category => {
        return typeof sub === 'object' && sub !== null && 'id' in sub;
      });
    
    return {
      ...doc,
      subcategories: validSubcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        color: sub.color || null,
      })),
    };
  });

  return (
    <div className={`flex flex-col min-h-screen ${poppins.className}`}>
      <Navbar />
      <SearchFilter data={formattedData} />
      {children}
    </div>
  )
}
export default Layout
