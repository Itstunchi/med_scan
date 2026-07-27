const Navbar = () => {
    return ( 
        <nav className="navbar">
            <div className="logo">
                MediScan
            </div>
            <ul className="nav-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How it works</a></li>
                <li><a href="#services">Services</a></li>
                <li>
                    <button className="login-btn">Log In</button>
                </li>
            </ul>
        </nav>
     );
}
 
export default Navbar;