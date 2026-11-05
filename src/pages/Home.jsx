import { useEffect } from 'react';
import { useCover } from '../lib/cover.js';
import Hero from '../components/Hero.jsx';
import Services from '../components/Services.jsx';
import FilePrep from '../components/FilePrep.jsx';
import Steps from '../components/Steps.jsx';
import Contact from '../components/Contact.jsx';

export default function Home() {
  const cover = useCover();

  // arriving from another page with /#services etc.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView(), 50);
  }, []);

  return (
    <main id="top">
      <Hero cover={cover} />
      <Services />
      <FilePrep />
      <Steps />
      <Contact />
    </main>
  );
}
