import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import Estimator from './components/Estimator.jsx';
import FilePrep from './components/FilePrep.jsx';
import Steps from './components/Steps.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Services />
        <Estimator />
        <FilePrep />
        <Steps />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
