
import SubNavbar from "@/components/shared/SubNavbar";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/shared/Sidebar";
import AuthProvider from "@/providers/AuthProvider";
import { ToastContainer } from "react-toastify";
import Mock from "@/components/shared/Mock";




export const metadata = {
  title: "Formlyze",
  description: "Formlyze",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-white">
      <body
        className={`antialiased font-outfit bg-white dark:bg-white `}
      >


<ToastContainer/>
<AuthProvider>

<Navbar/>


<div className="flex justify-between bg-white">
<Sidebar/>

<Mock/>
<div className="flex-1 relative">
<SubNavbar/>
<div className="overflow-auto scrollbar-none bg-white">
{children}
</div>
</div>

</div>
</AuthProvider>







    
      </body>
    </html>
  );
}
