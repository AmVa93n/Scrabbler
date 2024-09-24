import { AuthContext } from "../context/auth.context";
import { useContext } from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import CallToAction from '../components/CallToAction';

function HomePage() {
  const User = useContext(AuthContext).user;

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CallToAction />
    </>
  );
}

export default HomePage;