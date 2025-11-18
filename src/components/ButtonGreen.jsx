import 'styles/Button.css'

function ButtonGreen ({text, href, target = "_self"}) {
    return( 
<a className="Button Green" 
href={href} 
target={target}>
    <p>{text}</p>
</a>
    )
}
export default ButtonGreen;
