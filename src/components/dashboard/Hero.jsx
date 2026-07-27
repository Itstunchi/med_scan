import heroImage from '../../assets/HeroImage.png';
const Hero = () => {
    return ( 
        <section className="hero"
        style={{ backgroundImage: `url(${heroImage})` }}>
           
            <div className='overlay'></div>
            <div className="hero-content">
                <h1>Your medical records,
                    <br/>
                    <span className="highlight">organized & secure</span>
                </h1>
                <p>Upload,organize and access your medical reports
                    in one secure dashboard
                </p>
                <div className='buttons'>
                    <button className='primary'>Get Started </button>
                    <button className='secondary'>Sign In</button>
                </div>
              
              <div className="hero-stats">
                    <div className="stat-item">
                        <strong>256-bit</strong>
                        <span>Encryption</span>
                    </div>
                    <div className="stat-item">
                        <strong>24/7</strong>
                        <span>Access</span>
                    </div>
                    <div className="stat-item">
                        <strong>100%</strong>
                        <span>HIPAA Compliant</span>
                    </div>
                </div>
            </div>
        </section>
     );
}
 
export default Hero;