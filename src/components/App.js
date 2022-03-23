import React from "react";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import apiReact from "../utils/apiReact";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import { Route, Switch, useHistory } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";
import InfoTooltip from "./InfoTooltip";
import apiAuth from "../utils/AuthApi";

function App() {
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] =
    React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState({});
  const [isPopupImageOpen, setPopupImageOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState({});
  const [cards, setCards] = React.useState([]);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [isIsInfoTooltipOpen, setIsInfoTooltipOpen] = React.useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] =
    React.useState(false);
  const [email, setEmail] = React.useState("");
  const history = useHistory();

  React.useEffect(() => {
    Promise.all([apiReact.getProfileData(), apiReact.getInitialCards()])
      .then(([user, cards]) => {
        setCurrentUser(user);
        setCards(cards);
      })
      .catch((err) => console.log(`Ошибка: ${err.status}`));
  }, []);
  React.useEffect(() => {
    tokenCheck();
  }, []);

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleCardClick(data) {
    setSelectedCard(data);
    setPopupImageOpen(true);
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setPopupImageOpen(false);
  }
  function handleUpdateUser(data) {
    apiReact
      .editProfile(data)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((err) => console.log(`Ошибка: ${err.status}`));
  }
  function handleUpdateAvatar(url) {
    apiReact
      .setNewAvatar(url)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((err) => console.log(`Ошибка: ${err.status}`));
  }
  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    // Отправляем запрос в API и получаем обновлённые данные карточки
    apiReact
      .changeLikeCardStatus(card._id, isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => console.log(`Ошибка: ${err.status}`));
  }

  function handleCardDelete(card) {
    // let newCards = cards.filter((element) => element._id !== card._id);
    apiReact
      .deleteCard(card._id)
      .then(() => {
        setCards((cards) =>
          cards.filter((element) => element._id !== card._id)
        );
      })
      .catch((err) => console.log(`Ошибка: ${err.status}`));
  }
  function handleAddPlaceSubmit(newCard) {
    apiReact
      .addNewCard(newCard)
      .then((newCards) => {
        setCards([newCards, ...cards]);
        closeAllPopups();
      })
      .catch((err) => console.log(`Ошибка: ${err.status}`));
  }
  function closeInfoTooltip() {
    setIsInfoTooltipOpen(false);
    if (isRegistrationComplete) {
      history.push("/sign-in");
    }
  }

  const handleLoggedIn = () => {
    setLoggedIn(true);
  };
  const handleEmail = (email) => {
    setEmail(email);
  };

  const tokenCheck = () => {
    const jwt = localStorage.getItem("token");
    if (jwt) {
      apiAuth.checkToken(jwt).then((data) => {
        handleLoggedIn();
        handleEmail(data.data.email);
        history.push("/");
      });
    }
  };


  function signOut() {
    setLoggedIn(false);
    localStorage.removeItem("token");
    history.push("/sign-in");
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="main-page">
        <Header userEmail={email} onSignOut={signOut} />
        <div className="main-page__container">
          <Switch>
            <Route path="/sign-up">
              <Register
                setIsInfoTooltipOpen={setIsInfoTooltipOpen}
                setIsRegistrationComplete={setIsRegistrationComplete}
              />
            </Route>
            <Route path="/sign-in">
              <Login
                setIsInfoTooltipOpen={setIsInfoTooltipOpen}
                setIsRegistrationComplete={setIsRegistrationComplete}
                loggedIn={handleLoggedIn}
                email={handleEmail}
              />
            </Route>
            <ProtectedRoute
              exact
              path="/"
              loggedIn={loggedIn}
              component={Main}
              onEditAvatar={handleEditAvatarClick}
              onAddPlace={handleAddPlaceClick}
              onEditProfile={handleEditProfileClick}
              onCardClick={handleCardClick}
              cards={cards}
              onCardLike={handleCardLike}
              onCardDelete={handleCardDelete}
            ></ProtectedRoute>
          </Switch>
          <Footer />
        </div>
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
        />

        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
        />

        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
        />

        <ImagePopup
          card={selectedCard}
          isOpen={isPopupImageOpen}
          onClose={closeAllPopups}
        />
        <InfoTooltip
          isOpen={isIsInfoTooltipOpen}
          onClose={closeInfoTooltip}
          registrationComplete={isRegistrationComplete}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
