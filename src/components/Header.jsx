import logoMesto from "../images/Mesto_Russia.svg";

function Header() {
  return (
    <header className="header">
      <img src={logoMesto} alt="Лого Место" className="header__logo" />
    </header>
  );
}
export default Header;
