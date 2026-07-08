import 'styles/Button.css';
import Link from "next/link"; 

function ButtonGreen({ text, href, target = "_self" }) {
    const destination = href || "#"; 

    return( 
        <Link 
            href={destination} 
            className="bj-btn bj-btn-green" 
            target={target}
        >
            {text}
        </Link>
    )
}

export default ButtonGreen;