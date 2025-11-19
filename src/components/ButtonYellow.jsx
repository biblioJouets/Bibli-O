import 'styles/Button.css'
import Link from 'next/link';

function ButtonYellow ({text, href, target = "_self"}) {
    const destination = href || "#"; 

    return( 
        <Link 
            href={destination} 
            className="Button Yellow" 
            target={target}
        >
            <p>{text}</p>
        </Link>
    )
}

export default ButtonYellow;