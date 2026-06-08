import Hero from "./components/Hero";
import About from "./components/About";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-black">
      <Hero />
      <About />
    </main>
  );
}

