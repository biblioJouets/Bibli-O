import 'styles/Button.css';

function ButtonBlue ({text, href, target = "_self"}) {
    return( 
<a className="Button Blue" 
href={href} 
target={target}>
    <p>{text}</p>
</a>
    )
}
export default ButtonBlue;
