import Footer from "@/components/shared/Footer/Footer";
import Navbar from "@/components/shared/Navbar/Navbar";
// import HeaderProgress from "./_components/header-progress";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="">
      <Navbar />
      <main>
      {/* <HeaderProgress/> */}
      {children}
      </main>
      <Footer />
    </div>
  );
}
