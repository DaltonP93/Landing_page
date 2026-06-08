import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Products from '@/components/Products';
import WhyUs from '@/components/WhyUs';
import Pricing from '@/components/Pricing';
import DemoRequest from '@/components/DemoRequest';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import Particles from '@/components/Particles';

export default function Home() {
  return (
    <>
      <Particles />
      <Navbar />
      <main>
        <Hero />
        <Products />
        <WhyUs />
        <Pricing />
        <DemoRequest />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
