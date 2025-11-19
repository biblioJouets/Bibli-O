import 'styles/Button.css';
import Link from "next/link"; 
function ButtonBlue ({text, href, target = "_self"}) {

    const destination = href || "#";

    return( 
        <Link 
            href={destination} 
            className="Button Blue" 
            target={target}
        >
            <p>{text}</p> 
        </Link>
    )
}

export default ButtonBlue;
