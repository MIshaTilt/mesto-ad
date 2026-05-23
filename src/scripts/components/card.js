export const checkIsLiked = (likeButton) => {
  return likeButton.classList.contains("card__like-button_is-active");
};

export const updateLikeStatus = (likeButton, likeCountElement, likesArray) => {
  likeButton.classList.toggle("card__like-button_is-active");
  likeCountElement.textContent = likesArray.length;
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardDOM = (
  data,
  currentUserId,
  { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCountElement = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (likeCountElement) {
    likeCountElement.textContent = data.likes.length;
  }

  const isLikedByMe = data.likes.some((user) => user._id === currentUserId);
  if (isLikedByMe) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (data.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
  }

  likeButton.addEventListener("click", () => onLikeIcon(likeButton, data._id, likeCountElement));
  cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));

  return cardElement;
};

