const Navbar = () => {
    return ( 
        <nav className="navbar">
            <div className="logo">
                MediScan
            </div>
            <ul className="nav-links">
                <li>Features</li>
                <li>How it works</li>
                <li>Services</li>
                <li>
                    <button className="login-btn">Log In</button>
                </li>
            </ul>
        </nav>
     );
}
 
export default Navbar;