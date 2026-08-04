import 'styles/Button.css';
import Link from "next/link"; 

function ButtonYellow({ text, href, target = "_self" }) {
    const destination = href || "#"; 

    return( 
        <Link 
            href={destination} 
            className="bj-btn bj-btn-yellow" 
            target={target}
        >
            {text}
        </Link>
    )
}

export default ButtonYellow;