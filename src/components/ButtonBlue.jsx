import 'styles/Button.css';
import Link from "next/link"; 

function ButtonBlue({ text, href, target = "_self" }) {
    const destination = href || "#";

    return( 
        <Link 
            href={destination} 
            className="bj-btn bj-btn-blue" 
            target={target}
        >
            {text}
        </Link>
    )
}

export default ButtonBlue;