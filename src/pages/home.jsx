
import Hero from '../components/dashboard/Hero';
import Navbar from '../components/dashboard/navbar';
import Features from '../components/Features';
import Footer from '../components/Footer';
import HowItWorks from '../components/HowItWorks';
import Services from '../components/services';
// import HowItWorks from '../components/HowItWorks';
const Home = () => {
    return ( 
        <>
            {/* <navbar /> */}
            <Navbar />
            <Hero/>
            <Features/>
            <HowItWorks />
            <Services/>
            <Footer />
         
          
            
          
        </>
     );
}
 
export default Home;