// import { Link } from 'react-router-dom'

// const Navbar = () => {
//     return ( 
//         <nav className="navbar">
//             <div className="logo">
//                 MediScan
//             </div>
//             <ul className="nav-links">
//                 <li><a href="#features">Features</a></li>
//                 <li><a href="#how-it-works">How it works</a></li>
//                 <li><a href="#services">Services</a></li>
//                 <li>
//                     <Link to="/login" className="login-btn">Log In</Link>
//                 </li>
//             </ul>
//         </nav>
//      );
// }

// export default Navbar
import { Link } from 'react-router-dom'

const Navbar = () => {
    return ( 
        <nav className="navbar">
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0284c7', letterSpacing: '-0.5px' }}>
                MediScan
            </span>
            <ul className="nav-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How it works</a></li>
                <li><a href="#services">Services</a></li>
                <li>
                    <Link to="/login" className="login-btn">Log In</Link>
                </li>
            </ul>
        </nav>
     );
}

export default Navbar