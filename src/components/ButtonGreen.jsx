import Link from 'next/link';
import 'styles/Button.css';

function ButtonGreen ({text, href, target = "_self"}) {
    const destination = href || "#"; 

    return( 
        <Link 
            href={destination} 
            className="Button Green" 
            target={target}
        >
            <p>{text}</p>
        </Link>
    )
}

export default ButtonGreen;