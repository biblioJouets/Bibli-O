import 'styles/Button.css'

function ButtonYellow ({text, href, target = "_self"}) {
    return( 
<a className="Button Yellow" 
href={href} 
target={target}>
    <p>{text}</p>
</a>
    )
}
export default ButtonYellow;
