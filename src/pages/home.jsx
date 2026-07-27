
import Hero from '../components/dashboard/Hero';
import Navbar from '../components/dashboard/navbar';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
// import HowItWorks from '../components/HowItWorks';
const Home = () => {
    return ( 
        <>
            {/* <navbar /> */}
            <Navbar />
            <Hero/>
            <Features/>
            <HowItWorks />
            
          
        </>
     );
}
 
export default Home;