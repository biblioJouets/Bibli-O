import 'styles/Button.css'

function ButtonRed ({text, href, target = "_self"}) {
    return( 
<a className="Button Red" 
href={href} 
target={target}>
    <p>{text}</p>
</a>
    )
}
export default ButtonRed;
