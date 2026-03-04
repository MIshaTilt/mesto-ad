// Отображает сообщение об ошибке под невалидным полем
const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  errorElement.textContent = errorMessage;
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.classList.add(settings.errorClass);
};

// Скрывает сообщение об ошибке
const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  errorElement.textContent = '';
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.classList.remove(settings.errorClass);
};

// Проверяет валидность конкретного поля
const checkInputValidity = (formElement, inputElement, settings) => {
  let errorMessage = '';
  
  // Проверка на обязательное поле
  if (inputElement.validity.valueMissing) {
    errorMessage = inputElement.validationMessage;
  } 
  // Проверка на неверный формат (для URL и других типов)
  else if (inputElement.validity.typeMismatch) {
    errorMessage = inputElement.validationMessage;
  }
  // Проверка на слишком короткое/длинное значение
  else if (inputElement.validity.tooShort || inputElement.validity.tooLong) {
    errorMessage = inputElement.validationMessage;
  }
  // Проверка на недопустимые символы (для имени и названия места)
  else if (inputElement.validity.patternMismatch) {
    errorMessage = inputElement.dataset.errorMessage || inputElement.validationMessage;
  }
  // Другие ошибки валидации
  else if (!inputElement.validity.valid) {
    errorMessage = inputElement.validationMessage;
  }

  if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, errorMessage, settings);
    return false;
  }
  
  hideInputError(formElement, inputElement, settings);
  return true;
};

// Возвращает true, если хотя бы одно поле формы не прошло валидацию
const hasInvalidInput = (formElement, settings) => {
  const inputs = Array.from(formElement.querySelectorAll(settings.inputSelector));
  return inputs.some((inputElement) => !inputElement.validity.valid);
};

// Делает кнопку формы неактивной
const disableSubmitButton = (formElement, settings) => {
  const submitButton = formElement.querySelector(settings.submitButtonSelector);
  submitButton.classList.add(settings.inactiveButtonClass);
  submitButton.disabled = true;
};

// Включает кнопку формы
const enableSubmitButton = (formElement, settings) => {
  const submitButton = formElement.querySelector(settings.submitButtonSelector);
  submitButton.classList.remove(settings.inactiveButtonClass);
  submitButton.disabled = false;
};

// Включает или отключает кнопку формы в зависимости от валидности всех полей
const toggleButtonState = (formElement, settings) => {
  const inputs = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const isValid = inputs.every((inputElement) => inputElement.validity.valid);
  
  if (isValid) {
    enableSubmitButton(formElement, settings);
  } else {
    disableSubmitButton(formElement, settings);
  }
};

// Добавляет обработчики события input для всех полей формы
const setEventListeners = (formElement, settings) => {
  const inputs = Array.from(formElement.querySelectorAll(settings.inputSelector));
  
  inputs.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(formElement, settings);
    });
  });
  
  // Инициализация состояния кнопки при загрузке
  toggleButtonState(formElement, settings);
};

// Очищает ошибки валидации формы и делает кнопку неактивной
const clearValidation = (formElement, settings) => {
  const inputs = Array.from(formElement.querySelectorAll(settings.inputSelector));
  
  inputs.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
  });
  
  disableSubmitButton(formElement, settings);
};

// Включает валидацию для всех форм
const enableValidation = (settings) => {
  const forms = Array.from(document.querySelectorAll(settings.formSelector));
  
  forms.forEach((formElement) => {
    setEventListeners(formElement, settings);
  });
};

export { 
  enableValidation, 
  clearValidation,
  showInputError,
  hideInputError,
  checkInputValidity,
  hasInvalidInput,
  disableSubmitButton,
  enableSubmitButton,
  toggleButtonState,
  setEventListeners
};
