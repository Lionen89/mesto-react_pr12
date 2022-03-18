import logoMesto from "../images/Mesto_Russia.svg";

function Header(props) {
  return (
    <header className="header">
      <img src={logoMesto} alt="Лого Место" className="header__logo" />
      <a href="/sing-up" className='header__link'>{props.headerLinkName}</a>
    </header>
  );
}
export default Header;
