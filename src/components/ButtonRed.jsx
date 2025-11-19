import 'styles/Button.css';
import Link from "next/link"; 
function ButtonRed ({text, href, target = "_self"}) {

    const destination = href || "#";

    return( 
        <Link 
            href={destination} 
            className="Button Red" 
            target={target}
        >
            <p>{text}</p> 
        </Link>
    )
}

export default ButtonRed;
