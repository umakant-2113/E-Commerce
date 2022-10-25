/** @format */

let userName = document.querySelector(`.user-name`);
let block = document.querySelector(`.block`);
let unblock = document.querySelector(`.unblock`);

function unblockFunction(e) {
  console.log(e.target);
}

function blockFunction(e) {
  // console.log(e.target);
}

unblock.addEventListener(`click`, unblockFunction);

block.addEventListener(`click`, blockFunction);
