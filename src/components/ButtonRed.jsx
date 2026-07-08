import 'styles/Button.css';
import Link from "next/link"; 

function ButtonRed({ text, href, target = "_self" }) {
    const destination = href || "#";

    return( 
        <Link 
            href={destination} 
            className="bj-btn bj-btn-red" 
            target={target}
        >
            {text}
        </Link>
    )
}

export default ButtonRed;