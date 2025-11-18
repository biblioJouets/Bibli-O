import ButtonBlue from "./ButtonBlue";
import ButtonRed from "./ButtonRed";
import 'styles/Button.css'
function ButtonDuo ({blueText, redText, blueHref, redHref, target = "_self"}) {
    return( 
<div className="ButtonDuo">
    <ButtonBlue text={blueText} href={blueHref} target={target}/>
    <ButtonRed text={redText} href={redHref} target={target}/>
</div>
    )
}
export default ButtonDuo;
