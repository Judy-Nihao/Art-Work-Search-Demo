const grid = document.querySelector(".grid");
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

// 載入示意圖出現 (網頁初始)
grid.classList.add("active");

getData();



searchBtn.addEventListener("click", function(e){
  // 阻止 input type="submit" 跳出刷新頁面
  e.preventDefault();
  q = searchBar.value;

  //只要是按下搜尋按鈕的，一次就只會重新回傳24件作品
  endpoint = `https://api.artic.edu/api/v1/artworks/search?q=${q}&query[term][is_public_domain]=true&limit=24&fields=id,title,image_id,artist_display,thumbnail,classification_titles`;
  console.log(q);

  // 載入示意圖出現
  let timeoutBgShow;
  timeoutBgShow = setTimeout(() => {
    grid.classList.add("active");
  }, 400);

  getData();
});

function getData(){
  axios.get(endpoint)
    .then((res)=>{

      let dataArr = res.data.data;
      renderCard(dataArr);

      let tagName = document.querySelectorAll(".art__tagName");
      tagName.forEach((style)=>{
      
      if( style.textContent == "undefined"){
        style.classList.add("is__hidden");
      }
    })


    // 載入示意圖消失
    let timeoutBgNone;
    timeoutBgNone = setTimeout(() => {
      grid.classList.remove("active");
      console.log("消失");
    }, 600);

    getMasonry();


    const gridItem = grid.querySelectorAll(".grid-item");
    const closeBtn = grid.querySelectorAll(".close");

    //點開圖卡後禁止燈箱以外的背景滾動
    gridItem.forEach(item => {
      item.addEventListener("click", () => {
        document.body.style.overflow="hidden";
      })
    })

    //關閉圖卡後恢復 body 可滾動
    closeBtn.forEach(btn => {
      btn.addEventListener("click", () => {
        document.body.style.overflow="auto";
      })
    })
    
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

    // 有些作品例的 item.thumbnail.width 是 null 例如：梵谷的 The Bedroom 
    // 這樣變數賦值會出錯，所以要先確保 width 這個屬性有東西，才賦予給變數
    // 必須要 thumbnail 和 thumbnaill.width 都不是 null 
    let imgMaxWidth;

    if(item.thumbnail !== null && item.thumbnail.width !== null){
      imgMaxWidth = item.thumbnail.width;
    };
    
    let alt = thumb.alt_text || "it's an artpiece but no picture to be shown";
    let categ = item.classification_titles;
    let imgID = item.image_id;
    let imgUrl = `https://www.artic.edu/iiif/2/${imgID}/full/843,/0/default.jpg`;


    // 有些圖片寬度小於 843 px，要求 843 會無法取得圖片。
    // 若圖片尺寸小於 843 ， 就以圖片實際寬度尺寸為準
    // 若作品缺少圖片，根本沒有image_id 資料是 null ，就替換成本地端的「no-pic」示意圖。

    if(imgMaxWidth < 843){
      imgUrl = `https://www.artic.edu/iiif/2/${imgID}/full/${imgMaxWidth},/0/default.jpg`;
    }else if (imgID == null){
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
    itemSelector: ".grid-item",
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
