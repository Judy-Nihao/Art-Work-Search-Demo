const grid = document.querySelector(".grid");
const gridItem = document.querySelector(".grid-item");
const searchForm = document.querySelector("#search")
const searchBar = document.querySelector("#search__bar");
const searchBtn = document.querySelector("#search__btn");
const loadMoreBtn = document.querySelector(".load-more");


let q = searchBar.value;
let limit = 24;
let endpoint = `https://api.artic.edu/api/v1/artworks/search?q=${q}&query[term][is_public_domain]=true&limit=${limit}&fields=id,title,image_id,artist_display,thumbnail,classification_titles`;

// console.log(endpoint);

let str1 = "";
let str2 = "";


getData();
console.log("我只會 hi 一次");



searchBtn.addEventListener("click", function(e){
  // 阻止 input type="submit" 跳出刷新頁面
  e.preventDefault();
  q = searchBar.value;

  //只要是按下搜尋按鈕的，一次就只會重新回傳24件作品
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

    // 本來容器有一張背景圖片示意載入中，只要美術圖卡瀑布流排版完成，就讓載入示意圖消失。
    grid.style.backgroundImage = "none";
    
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
          <a href="#/" class="close"></a>
          <a class="lightbox__image" href="${imgUrl}" target="__blank">
            <img src="${imgUrl}" alt="${alt}">
          </a>
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


// 等到api抓到的資料都載入進來DOM之後，才開始進行瀑布流排版
// 用原生 JS 撰寫即可，不用另外載入 jQuery
function getMasonry(){
  imagesLoaded(".grid",{ background: true },function() {
    const masonry = new Masonry(".grid",{ 
    itemSelector: '.grid-item',
    columnWidth: ".grid-sizer",
    gutter: 15,
    percentPosition: true,
    // isFitWidth: true // 這個屬性如果加上去圖片會橫向溢出去
    });

  });
}; 

// 點擊 Load More 按鈕載入入更多圖片
// 每次點擊都會累加 8 件作品，然後整個重新渲染圖卡，
// 從渲染 24件 > 32件 > 40件 > ...  
// 視覺上看起來就會是每點擊一次就增生 8 件
loadMoreBtn.addEventListener("click", function(){
  limit += 8;
  console.log(limit);
  endpoint = `https://api.artic.edu/api/v1/artworks/search?q=${q}&query[term][is_public_domain]=true&limit=${limit}&fields=id,title,image_id,artist_display,thumbnail,classification_titles`;
  getData();
})
