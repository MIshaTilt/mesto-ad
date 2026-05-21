import { 
  getUserInfo, getCardList, setUserInfo, 
  setUserAvatar, addCard, deleteCardApi, changeLikeCardStatus 
} from "./components/api.js";
import { createCardDOM } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const logoElement = document.querySelector(".header__logo");
const infoModalWindow = document.querySelector(".popup_type_info");
const infoList = infoModalWindow.querySelector(".popup__info");
const popularCardsList = infoModalWindow.querySelector(".popup__list");

const definitionTemplate = document.getElementById("popup-info-definition-template");
const previewTemplate = document.getElementById("popup-info-user-preview-template");

logoElement.style.cursor = "pointer";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

let currentUserId = null;

const renderLoading = (isLoading, button, buttonText = 'Сохранить', loadingText = 'Сохранение...') => {
  if (isLoading) {
    button.textContent = loadingText;
  } else {
    button.textContent = buttonText;
  }
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeCard = (likeButton, cardId, likeCountElement) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      likeCountElement.textContent = updatedCard.likes.length;
    })
    .catch((err) => console.error(`Ошибка при постановке лайка: ${err}`));
};

const handleDeleteCard = (cardElement, cardId) => {
  deleteCardApi(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => console.error(`Ошибка при удалении карточки: ${err}`));
};


Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      const cardElement = createCardDOM(cardData, currentUserId, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeCard,
        onDeleteCard: handleDeleteCard,
      });
      placesWrap.append(cardElement);
    });
  })
  .catch((err) => {
    console.error(`Ошибка при загрузке данных: ${err}`);
  });


const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;
  renderLoading(true, submitButton, initialText);

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((updatedUser) => {
      profileTitle.textContent = updatedUser.name;
      profileDescription.textContent = updatedUser.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => console.error(`Ошибка при обновлении профиля: ${err}`))
    .finally(() => renderLoading(false, submitButton, initialText));
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;
  renderLoading(true, submitButton, initialText);

  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      evt.target.reset(); 
    })
    .catch((err) => console.error(`Ошибка при обновлении аватара: ${err}`))
    .finally(() => renderLoading(false, submitButton, initialText));
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;
  renderLoading(true, submitButton, initialText, 'Создание...');

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      const cardElement = createCardDOM(newCard, currentUserId, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeCard,
        onDeleteCard: handleDeleteCard,
      });

      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModalWindow);
      evt.target.reset();
    })
    .catch((err) => console.error(`Ошибка при создании карточки: ${err}`))
    .finally(() => renderLoading(false, submitButton, initialText));
};

const createDefinitionItem = (term, desc) => {
  const el = definitionTemplate.content.cloneNode(true);
  const dt = el.querySelector("dt") || el.firstElementChild;
  const dd = el.querySelector("dd") || el.lastElementChild;
  
  if (dt) dt.textContent = term;
  if (dd) dd.textContent = desc;
  
  return el;
};

const createPreviewItem = (text) => {
  const el = previewTemplate.content.cloneNode(true);
  const li = el.querySelector("li") || el.firstElementChild;
  if (li) li.textContent = text;
  
  return el;
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      infoList.innerHTML = "";
      popularCardsList.innerHTML = "";

      const uniqueUsers = new Set(cards.map((card) => card.owner._id));
      const totalUsers = uniqueUsers.size;

      const totalLikes = cards.reduce((sum, card) => sum + card.likes.length, 0);

      const likesByAuthor = cards.reduce((acc, card) => {
        const authorId = card.owner._id;
        if (!acc[authorId]) {
          acc[authorId] = { name: card.owner.name, likes: 0 };
        }
        acc[authorId].likes += card.likes.length;
        return acc;
      }, {});

      let maxLikes = 0;
      let champion = "Нет данных";

      for (const id in likesByAuthor) {
        if (likesByAuthor[id].likes > maxLikes) {
          maxLikes = likesByAuthor[id].likes;
          champion = likesByAuthor[id].name;
        }
      }

      infoList.append(createDefinitionItem("Всего пользователей:", totalUsers));
      infoList.append(createDefinitionItem("Всего лайков:", totalLikes));
      infoList.append(createDefinitionItem("Максимально лайков от одного:", maxLikes));
      infoList.append(createDefinitionItem("Чемпион лайков:", champion));

      const topCards = [...cards]
        .sort((a, b) => b.likes.length - a.likes.length)
        .slice(0, 3);

      topCards.forEach((card) => {
        popularCardsList.append(createPreviewItem(card.name));
      });

      openModalWindow(infoModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при получении статистики карточек:", err);
    });
};

logoElement.addEventListener("click", handleLogoClick);

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);