import { Header } from "@/components/LandingPage/Header";
import { Hero } from "@/components/LandingPage/Hero";
import { Services } from "@/components/LandingPage/Services";
import { About } from "@/components/LandingPage/About";
import { Contact } from "@/components/LandingPage/Contact";
import { Footer } from "@/components/LandingPage/Footer";
export default function Home() {
  return (
    <div className="min-h-screen">
   
        <Header />
        <Hero />
        <Services />
        <About />
        <Contact />
        <Footer />

    </div>
  );
}
