const grid = document.querySelector(".grid");
const gridItem = document.querySelector(".grid-item");
const searchForm = document.querySelector("#search")
const searchBar = document.querySelector("#search__bar");
const searchBtn = document.querySelector("#search__btn");


let q = searchBar.value;
let endpoint = `https://api.artic.edu/api/v1/artworks/search?q=${q}&query[term][is_public_domain]=true&limit=24&fields=id,title,image_id,artist_display,thumbnail,classification_titles`;

let str1 = "";
let str2 = "";


getData();
console.log("我只會 hi 一次");


// searchBar.addEventListener("keyup", function(e){
//   console.log(searchBar.value);
//   if (e.key === "Enter") {
//     console.log("有按Enter");
//   }
// });

searchBtn.addEventListener("click", function(e){
  // 阻止 input type="submit" 跳出刷新頁面
  e.preventDefault();
  q = searchBar.value;

  endpoint = `https://api.artic.edu/api/v1/artworks/search?q=${q}&query[term][is_public_domain]=true&limit=24&fields=id,title,image_id,artist_display,thumbnail,classification_titles`;
  console.log(q);
  getData();
});

function getData(){
  axios.get(endpoint)
    .then((res)=>{
      // console.log(res.data.data);

      let dataArr = res.data.data;
      renderCard(dataArr);

      let tagName = document.querySelectorAll(".art__tagName");
      tagName.forEach((style)=>{
      
      if( style.textContent == "undefined"){
        style.classList.add("is__hidden");
      }

    })

    getMasonry();
    
  })
    .catch((err)=>{
      console.log(err);
  });
}


function renderCard(info){
  // 每次生成卡片前都先清空畫面既有圖卡資料
  grid.innerHTML = "";
  //字串要清空！不然會一直存著上一次輸入的資料導致重複渲染！
  str1 = "";
  str2 = "";

  info.forEach((item)=>{
    let artist = item.artist_display;
    let artTitle = item.title;
    
    // 如果 item.thumbnail 存取到的是 null，因為網址會無法存取，因此改賦值為 NaN
    // 這樣 alt 也會不成立，就改賦值為 || 後面的這段文字
    
    let thumb = item.thumbnail || NaN; 
    let alt = thumb.alt_text || "it's an artpiece but no picture to be shown";
    let categ = item.classification_titles;
    let imgID = item.image_id;
    let imgUrl = `https://www.artic.edu/iiif/2/${imgID}/full/843,/0/default.jpg`;

    if(imgID == null){
      imgUrl = "img/no-pic.jpg";
    };


    str2 = `          
         <li class="art__tagName">${categ[0]}</li>
         <li class="art__tagName">${categ[1]}</li>
         <li class="art__tagName">${categ[2]}</li>
         <li class="art__tagName">${categ[3]}</li>
         `;
    
    str1 += ` 
    <a href="#${imgID}"class="art grid-item grid-sizer">
        <div class="art__imgBox">
        <img src="${imgUrl}" alt="${alt}"></div>
        <h3 class="art__title">${artTitle}</h3>
        <h4 class="art__artist">${artist}</h4>
        <ul class="art__tag">${str2}
        </ul>
    </a>
    
    <div class="lightbox">
      <div class="lightbox__wrap" id="${imgID}">
        <div class="lightbox__item">
          <a href="#" class="close"></a>
          <div class="lightbox__image">
            <img src="${imgUrl}" alt="${alt}">
          </div>
          <p class="art__title lightbox__title">${artTitle}</p>
          <p class="art__artist lightbox__artist">${artist}</p>
          <ul class="art__tag">
            ${str2}
          </ul>
        </div>
      </div>
    </div>`;  
    });

    grid.innerHTML = str1;
};



function getMasonry(){
    $('.grid').imagesLoaded({ background: true },function() {
      const masonry = new Masonry(".grid",{ 
      itemSelector: '.grid-item',
      columnWidth: ".grid-sizer",
      gutter: 15,
      percentPosition: true,
      // isFitWidth: true // 這個屬性如果加上去圖片會橫向溢出去
    });

  });
}; 



// // window.onload=function(){}
// function getMasonry(){ 
//       // 建立一個新的 Masonry 物件
//       const masonry = new Masonry(grid,{
//         itemSelector: ".grid-item",
//         // columnWidth: 200,
//         columnWidth: ".grid-sizer",
//         gutter: 0,
//         percentPosition: true
//     });
// };


