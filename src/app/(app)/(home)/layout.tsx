/// <reference types="next" />
import { Poppins } from "next/font/google"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

interface Props {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  return (
    <div className={`flex flex-col min-h-screen ${poppins.className}`}>
      {children}
    </div>
  )
}
export default Layout
