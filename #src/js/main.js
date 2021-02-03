'use strict';

let position = 0;

const slidesToShow   = 2,
      slidesToScroll = 1;

const container    = document.querySelector('.section-video__slider-list'),
      items        = container.querySelectorAll('.section-video__slider-item'),
      track        = container.querySelector('.section-video__slider-track'),
      btnPrev      = document.querySelector('.section-video__slider-left'),
      btnNext      = document.querySelector('.section-video__slider-right'),
      itemsCount   = items.length,
      itemWidth    = container.clintWidth / slidesToShow,
      movePosition = slidesToScroll * itemWidth;

items.forEach(item => {
   item.style.minWidth = `${itemWidth}px`;
});

btnNext.addEventListener('click', () => {
   const itemsLeft = itemsCount - (Math.abs(position + slidesToShow * itemWidth) / itemWidth);

   position -= itemsLeft >= slidesToScroll ? movePosition : itemsLeft * itemWidth;

   setPosition();
   checkBtn();
});

btnPrev.addEventListener('click', () => {
   const itemsLeft = itemsCount - Math.abs(position) / itemWidth;

   position += itemsLeft >= slidesToScroll ? movePosition : itemsLeft * itemWidth;

   setPosition();
   checkBtn();
});

const setPosition = () => {
   track.style.transform = `transformX(${position}px)`;
};

const checkBtn = () => {
   btnPrev.disabled = position === 0;
   btnNext.disabled = position === 0;
   
};

checkBtn();