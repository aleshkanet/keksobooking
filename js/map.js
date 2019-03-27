'use strict';

(function () {
  var OFFERS_AMOUNT = 8;
  var OFFER_TITLES = [
    'Большая уютная квартира',
    'Маленькая неуютная квартира',
    'Огромный прекрасный дворец',
    'Маленький ужасный дворец',
    'Красивый гостевой домик',
    'Некрасивый негостеприимный домик',
    'Уютное бунгало далеко от моря',
    'Неуютное бунгало по колено в воде'
  ];
  var MIN_OFFER_PRICE = 1000;
  var MAX_OFFER_PRICE = 1000000;
  var OFFER_TYPES = ['palace', 'flat', 'house', 'bungalo'];
  var MIN_OFFER_ROOMS = 1;
  var MAX_OFFER_ROOMS = 5;
  var CHECKIN_CHECKOUT_TIMES = ['12:00', '13:00', '14:00'];
  var OFFER_FEATURES = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];
  var MARKER_MIN_Y = 130;
  var MARKER_MAX_Y = 630;
  var MARKER_WIDTH = 50;
  var MARKER_HEIGHT = 70;

  var pin = document.querySelector('.map__pin--main');
  var MARKER_MIN_X = pin.offsetParent.offsetLeft;
  var MARKER_MAX_X = pin.offsetParent.offsetWidth - pin.offsetWidth;

  var OFFER_PHOTOS = [
    'http://o0.github.io/assets/images/tokyo/hotel1.jpg',
    'http://o0.github.io/assets/images/tokyo/hotel2.jpg',
    'http://o0.github.io/assets/images/tokyo/hotel3.jpg',
  ];

  var OFFER_TYPE_TEXT = {flat: 'Квартира', bungalo: 'Бунгало', house: 'Дом', palace: 'Дворец'};

  function getRandomInteger(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
  }
  function getRandomElement(arr) {
    var rand = Math.floor(Math.random() * arr.length);
    return arr[rand];
  }
  function compareRandom() {
    return Math.random() - 0.5;
  }
  function shuffleArray(arr) {
    return arr.sort(compareRandom);
  }
  function renderOfferData() {
    var offers = [];

    for (var i = 1; i <= OFFERS_AMOUNT; i++) {
      var locationX = getRandomInteger(MARKER_MIN_X, MARKER_MAX_X);
      var locationY = getRandomInteger(MARKER_MIN_Y, MARKER_MAX_Y);
      var offerRooms = getRandomInteger(MIN_OFFER_ROOMS, MAX_OFFER_ROOMS);
      var maxGuests = offerRooms * 2;

      var subsetLength = getRandomInteger(1, OFFER_FEATURES.length);
      var featuresSubset = OFFER_FEATURES.slice(0, subsetLength);

      offers.push({
        'author': {
          'avatar': 'img/avatars/user0' + i + '.png',
        },
        'offer': {
          'title': OFFER_TITLES[i - 1],
          'adress': locationX + ',' + locationY,
          'price': getRandomInteger(MIN_OFFER_PRICE, MAX_OFFER_PRICE),
          'type': getRandomElement(OFFER_TYPES),
          'rooms': offerRooms,
          'guests': getRandomInteger(offerRooms, maxGuests),
          'checkin': getRandomElement(CHECKIN_CHECKOUT_TIMES),
          'checkout': getRandomElement(CHECKIN_CHECKOUT_TIMES),
          'features': shuffleArray(featuresSubset),
          'description': '',
          'photos': shuffleArray(OFFER_PHOTOS)
        },
        'location': {
          'x': locationX - MARKER_WIDTH / 2,
          'y': locationY - MARKER_HEIGHT
        }
      });
    }
    return offers;
  }

  function renderPins(arr) {
    var pinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');
    var pinList = document.createDocumentFragment();

    for (var i = 0; i < arr.length; i++) {
      var pinElement = pinTemplate.cloneNode(true);
      var current = arr[i];

      pinElement.setAttribute('style', 'left:' + current.location.x + 'px; top:' + current.location.y + 'px;');
      pinElement.querySelector('img').setAttribute('src', current.author.avatar);
      pinElement.setAttribute('alt', current.offer.title);
      pinElement.setAttribute('data-key', i);

      pinList.appendChild(pinElement);
    }
    return pinList;
  }

  function renderFeatureList(arr) {
    var featureList = document.createDocumentFragment();

    for (var i = 0; i < arr.length; i++) {
      var currentFeature = arr[i];
      var listItem = document.createElement('li');

      listItem.classList.add('popup__feature', 'popup__feature--' + currentFeature);
      featureList.appendChild(listItem);
    }
    return featureList;
  }

  function renderPhotoList(arr) {
    var photoList = document.createDocumentFragment();

    for (var i = 0; i < arr.length; i++) {
      var src = arr[i];
      var img = document.createElement('img');

      img.setAttribute('src', src);
      img.setAttribute('width', 45);
      img.setAttribute('height', 40);
      img.classList.add('popup__photo');
      photoList.appendChild(img);
    }
    return photoList;
  }

  function renderOffer(arr) {
    var offer = arr.offer;
    var card = document.querySelector('#card').content.querySelector('.map__card');
    var cardElement = card.cloneNode(true);

    cardElement.querySelector('.popup__title').textContent = offer.title;
    cardElement.querySelector('.popup__text--address').textContent = offer.adress;
    cardElement.querySelector('.popup__text--price').textContent = offer.price + '₽/ночь.';
    cardElement.querySelector('.popup__type').textContent = OFFER_TYPE_TEXT[offer.type];
    cardElement.querySelector('.popup__text--capacity').textContent = offer.rooms + ' комнаты для ' + offer.guests + ' гостей';
    cardElement.querySelector('.popup__text--time').textContent = 'Заезд после ' + offer.checkin + ', выезд до ' + offer.checkout;
    cardElement.querySelector('.popup__features').innerHTML = '';
    cardElement.querySelector('.popup__features').appendChild(renderFeatureList(offer.features));
    cardElement.querySelector('.popup__description').textContent = offer.description;
    cardElement.querySelector('.popup__photos').innerHTML = '';
    cardElement.querySelector('.popup__photos').appendChild(renderPhotoList(offer.photos));
    cardElement.querySelector('.popup__avatar').setAttribute('src', arr.author.avatar);

    return cardElement;
  }

  var offersData = renderOfferData();
  var map = document.querySelector('.map');
  var pinsContainer = document.querySelector('.map__pins');
  var filterContainer = document.querySelector('.map__filters-container');

  function showPins() {
    var pins = renderPins(offersData);
    pinsContainer.appendChild(pins);
  }

  function toggleLockForm(form) {
    var fieldSets = form.querySelectorAll('fieldset');
    for (var i = 0; i < fieldSets.length; i++) {
      fieldSets[i].disabled = !fieldSets[i].disabled;
    }
  }

  function activatePage() {
    toggleLockForm(adForm);
    showPins();
    map.classList.remove('map--faded');
    updateAdress();
  }
  function initAdress() {
    var pinX = pin.offsetLeft + (pin.offsetWidth / 2);
    var pinY = pin.offsetTop + (pin.offsetHeight / 2);
    var addressField = document.querySelector('#address');
    addressField.value = pinX + ',' + pinY;
  }
  function updateAdress() {
    var pinX = pin.offsetLeft + (pin.offsetWidth / 2);
    var pinY = pin.offsetTop - (pin.offsetHeight / 2) - 22;
    var addressField = document.querySelector('#address');
    addressField.value = pinX + ',' + pinY;
  }
  var adForm = document.querySelector('.ad-form');
  if (adForm.classList.contains('ad-form--disabled')) {
    toggleLockForm(adForm);
  }

  var mainPin = document.querySelector('.map__pin--main');
  mainPin.addEventListener('mouseup', activatePage);

  initAdress();

  map.addEventListener('click', function (e) {
    var clickedElement = e.target;
    var tagName = clickedElement.tagName;
    var targetParent = clickedElement.parentElement;
    var hasKey = targetParent.hasAttribute('data-key');

    if (hasKey) {
      var key = targetParent.getAttribute('data-key');

      if (tagName === 'IMG') {
        var newOffer = renderOffer(offersData[key]);
        newOffer.setAttribute('data-key', key);
        var offer = map.querySelector('article[data-key="' + key + '"]');

        if (offer) {
          map.removeChild(offer);
          map.insertBefore(offer, filterContainer);
        } else {
          map.insertBefore(newOffer, filterContainer);
        }
      } else if (tagName === 'BUTTON' && clickedElement.classList.contains('popup__close')) {
        map.removeChild(targetParent);
      }
    }
  });

})();
