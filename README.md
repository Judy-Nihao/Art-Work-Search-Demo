# 實作紀錄：芝加哥藝術博物館圖庫搜尋 API 串接

## 實作網址
gh-pages
https://judy-nihao.github.io/Art-Work-Search-Demo

GitHub Repo
https://github.com/Judy-Nihao/Art-Work-Search-Demo

## 實現功能
- 輸入英語關鍵字搜尋館藏圖像
- 點擊搜尋按鈕或鍵盤輸入Enter皆可送出搜尋
- 切換搜尋關鍵字後即時渲染結果
- 使用瀑布流版面展示圖像
    - 結合 Images Loaded 套件
    - 結合 Masonry套件
- 點擊作品圖卡跳出燈箱展示全圖樣貌
- 點擊作品圖片另開新視窗看原始大圖

![image](https://hackmd.io/_uploads/SyAaU4M8h.jpg)

## 筆記

我一直都知道不少博物館有開放特定館藏資料庫，以前不懂得如何串接 API， 頂多是去開放圖庫下載圖片來用。在看了幾個 unsplash 或是 pexels 圖庫 API 串接教學後，想要自己挑戰看看串接博物館的資料，剛好找到 [Art Institute of Chicago API](https://api.artic.edu/docs/#introduction)，有提供館藏圖片 API ，不需要額外申請 token ，只要弄清楚圖片的請求網址架構是怎麼拼組出來的就可以直接使用，很適合作為入門專案。而且芝加哥藝術博物館館藏包含莫內、梵谷、葛飾北齋等大師作品，想到圖庫館藏這麼珍貴就覺得躍躍欲試，嘗試實作出一個圖庫搜尋頁。

### API 網址結構


作品本身的相關資訊與作品圖像，是兩個分開的 API，分成：artworks API 和 image API。

artworks 資料庫裡面有關於作品的各種資料，例如：作品 id、作品圖片id 等等，必須先在 artworks API 回傳的資料中取得 image_id，再把 image_id 帶入image API 的網址結構，才能組合出最終圖片網址。

>  Our institution serves images via a separate API that is compliant with the IIIF Image API 2.0 (opens new window)specification. Using metadata from this API, you can craft URLs that will allow you to access images of artworks from our collection. [🔗](https://api.artic.edu/docs/#images)



###  artworks API 基本結構
```
https://api.artic.edu/api/v1/artworks
```

基本結構後面可以帶入篩選參數，參數之間用 `&` 串連。

```
https://api.artic.edu/api/v1/artworks/search?q=vincent&query[term][is_public_domain]=true&limit=24&fields=id,title,image_id,artist_display,thumbnail,classification_titles
```

- `/search?q=cats`：等號後面帶入搜尋關鍵字，上面示範是帶入 vincent。
- `query[term][is_public_domain]=true`：中間這段是規定要加上的寫法。
- `limit=24`：等號後面帶入的數字表示要載入多少件作品，寫 24 就是每次載入 24件。
- `fields=`：等號後面帶入篩選屬性。因為並不需要用上作品所有屬性資訊，只要回傳需要的部分即可。
    - id：作品本身的 id 號碼
    - title：作品標題
    - image_id：作品的圖像 id。
    - artist_display：創作者資訊，通常會有姓名，有時候還有生卒年份，但不見得每個都有年份。
    - thumbnail：這個屬性裡面有關於作品圖片的敘述，可以填入 HTML  `<img>` 的 `alt="" 屬性內。 
    - classification_titles：關於作品的分類。

```
注意：id 和 image_id 是兩個不同的事情。
```
上面這串網址請求後回傳資料結構如下圖
![image](https://hackmd.io/_uploads/B1WikEM8h.png)



### IIIF Image API

```
https://www.artic.edu/iiif/2/{identifier}/full/843,/0/default.jpg
```
- {identifier}：要替換成 image_id 
- full/843,/0/default：是規定的寫法，843 代表圖片寬度 843px，雖然也可以改成其他尺寸，但文件中建議使用 843 最穩定。

> Why the strange number—843px wide? This number is related to certain guidelines for the use of copyrighted materials (opens new window)within the museum field. Over time, it became the most common dimension used by our applications, so it is the size we continue to recommend. [🔗](https://api.artic.edu/docs/#image-sizes)


**組合出作品圖像網址**

artworks API 關鍵字搜尋 vincent ，回傳的第一筆物件 image_id 是 `25c31d8d-21a4-9ea1-1d73-6a2eca4dda7e` ，帶入圖片請求網址，組合後就是：

```
https://www.artic.edu/iiif/2/25c31d8d-21a4-9ea1-1d73-6a2eca4dda7e/full/843,/0/default.jpg
```

輸入瀏覽器，會得到梵谷知名的畫作 ***The Bedroom 在亞爾的臥室***
![image](https://hackmd.io/_uploads/By2oeVMIn.png)

### 資料渲染時要記得清空 innerHTML 和 str 字串

抓回來的資料，根據功能分類存進變數後組出字串，再把字串用 innerHTML 存進 grid 中，渲染出所有藝術品圖卡。
每次輸入新關鍵字就會觸發 renderCard()，要避免前一次的資料重複疊加渲染。


### 每次執行渲染都要清空 grid.innerHTML 以免舊內容累積在畫面上
```javascript!
grid.innerHTML = "";
```

### 每次執行渲染都要先清空字串

```javascript!
grid.innerHTML = "";
str1 = "";
str2 = "";
grid.innerHTML = str1;
```


不只要清空 innerHTML，還要清空字串！
由於 innerHTML  資料是來自於 str 變數，如果沒有每次一進入 function 就清空字串，字串會一直累積上一次的內容，就算清空 grid.innerHTML，str 字串內存取的舊資料，仍會重複渲染在畫面上。

之前卡在這邊很久鬼打牆.......後來才發現就是沒清空字串搞的鬼！


### api 取資料若遇到 null 要用 || (或者計算符)提供另一個備案值

有些藝術作品是沒有圖片的，也缺乏作品敘述，屬性值直接是 null 。



例如關鍵字輸入：van Gogh 時，有一幅 The Happy Owls (Uilen-Geluk) 就缺資料。
```
"thumbnail": null
"image_id": null
```
![image](https://hackmd.io/_uploads/Hk6uEDfIh.png)

由於我們是物件取值存入變數中，如果取不到值，存進變數就會報錯。

```javascript!

    // 跑forEach，item 代表每一個藝術品物件
    
    let thumb = item.thumbnail || NaN; 
    let alt = thumb.alt_text || "it's an artpiece but no picture to be shown";

    let imgID = item.image_id;
    let imgUrl = `https://www.artic.edu/iiif/2/${imgID}/full/843,/0/default.jpg`;

    if(imgID == null){
      imgUrl = "../img/no-pic.jpg";
    };

```

我遇到 2 種 null 的處理，不確定正統處理方式為何，但至少目前改寫方式能讓頁面順利運作。

### 第一種 null

```jsx
let alt = item.thumbnail.alt_text
```

由於那筆物件資料的 thumbnail 值是 null ，導致變數 alt 賦值不成功，會報錯 `Can’t not read property of null`，這邊的 null 指的就是 thumbnail ，所以 alt 存取不到。

必須先把 thumbnail 拉出來對他進行判斷，另外宣告一個變數 thumb 存取 `item.thumbnail` ，

若發現`item.thumbnail` 等於 null 時，就改賦予 NaN，

接著再對 alt 也做另一個判斷，如果 thumb = NaN，則 alt 會存取到 `NaN.alt_text`，會不成立，最後就會改抓 || 後面的字串存進 alt 變數。

```jsx
let thumb = item.thumbnail || NaN;
```

```jsx
let alt = thumb.alt_text || "it's an artpiece but no picture to be shown";
```

![image](https://hackmd.io/_uploads/r1w8PvfI2.png)


至於為什麼 thumb 要改賦予 NaN 其實是瞎矇到的，測試時發現寫 undefined 行不通，alt 會跟著存取到 undefined，但我希望 alt 要存取的是我客製化的文字。

而如果對 alt 直接寫 if 判斷式也行不通，曾經試過寫出以下判斷：

```jsx
if(item.thumbnail == null){
	 alt = "it's an artpiece but no picture to be shown";
}
```

這樣寫行不通是因為， alt 變數的資料是 thumbnail 的下一層 alt_text，瀏覽器一旦解析到 thumbnail 就會直接先報錯`Can’t not read property of null`，停在那邊，根本不會再往下處理 alt 變數。

最後才會選擇拆開判斷，先對 thumbnail 判斷一次賦值備案，再對 alt 判斷一次字串備案。


### 第二種 null

缺少 image_id，可是圖片 URL 網址是用組出來的，網址內必須要有image_id 才能成功取得正確網址。

```jsx
let imgID = item.image_id; 
let imgUrl = `https://www.artic.edu/iiif/2/${imgID}/full/843,/0/default.jpg`;

if(imgID == null){
    imgUrl = "../img/no-pic.jpg";
 };
```

解決辦法就是寫一個 if 判斷式，判斷 imgID 如果是 null，imgUrl 就直接替換成本地端的另一張圖片相對路徑。

### 兩種 null 的解決辦法差異

之所以圖片可以直接用 if 判斷式，但是上面的 alt 卻行不通，是因為
- alt 變數要存的資料是包兩層物件屬性才取到，但是取第一層屬性時就出問提了所以會卡住。
- imgUrl 只是抽換網址，沒有要再往下一層找什麼屬性，所以可以直接抽換掉內容。

渲染後的圖片會長下面這樣：

![image](https://hackmd.io/_uploads/ryS2_Pz82.jpg)


堂堂梵谷大畫家結果搜尋出來前24筆就立刻有缺資料的真心心累，但也學到一課。


### 關於 Input 搜尋欄

![image](https://hackmd.io/_uploads/HJBZ1rGU3.png)

```htmlembedded=
<form class="container search" id="search" >
    <input type="search" class="search__bar" id="search__bar" placeholder="請輸入英文關鍵字"  value="monet">
    <button type="submit" class="search__btn" id="search__btn"><i class='bx bx-search'></i>Search</button>
</form>
```


- `<input type="search">` 自動會有一個叉叉讓人可以點下去後移除 value 的預設值。

- 要注意`<button>` 標籤的類型是什麼。想觸發「搜尋」，可以用 `<button>`做按鈕，也可以用`<input type="submit">` 做按鈕，兩者做的是一樣的事情。

> The `<input type="submit">` defines a submit button which submits all form values to a form-handler. [**W3School**](https://www.w3schools.com/tags/att_input_type.asp)


放在 form 標籤內的 button ，若沒有特別設定 type ，在 input 欄位內輸入關鍵字，按下 enter 後，跟用滑鼠點擊 Search 按鈕同樣都會觸發 submit 行為。
 
我有對對 Search 按鈕進行點擊事件監聽，無論是鍵盤 Enter 還是滑鼠點擊搜尋按鈕，都會觸發點擊事件，渲染新資料。

```javascript!
searchBtn.addEventListener("click", function(e){
  // 阻止 input type="submit" 跳出刷新頁面
  e.preventDefault();
  q = searchBar.value;

  //只要是按下搜尋按鈕的，一次就只會重新回傳24件作品
  endpoint = `https://api.artic.edu/api/v1/artworks/search?q=${q}&query[term][is_public_domain]=true&limit=24&fields=id,title,image_id,artist_isplay,thumbnail,classification_titles`;
  console.log(q);
  getData();
});
```

但是，若改成 `<button type="button">`，鍵盤按 Enter 就不會渲染新資料，變成只會單純重整頁面。而直接點擊 Search 按鈕依舊會渲染新資料。

也就是說，在 form 標籤中， input 欄位內的鍵盤 Enter 行為，跟 button 的 type 是有相關的。

### Masonry 瀑布流排版 / 磚牆排版

需要結合使用 imagesLoaded、 Masonry 2種套件，才能順利呈現瀑布流版面。

Masonry 是一個套件，用來處理「垂直空間」不同尺寸區塊的自動佈局，它可以將高度不一的元素區塊，像堆砌磚頭那樣相疊。不過使用 Masonry 有一個關鍵，就是必須抓到元素高度，如果元素區塊內容是外部載入的圖片，Masonry 可能會因為圖片載入未完全就進行排版，高度不準，導致圖片重疊在一起。

因此 [Masonry 官網建議](https://masonry.desandro.com/layout.html#imagesloaded) 要搭配另一個套件 [imagesLoaded](https://imagesloaded.desandro.com/) ，確認所有圖片已經載入完成後，才開始進行瀑布流排版，就能解決重疊現象。

> 參考文章：https://powerkaifu.github.io/2020/11/14/lesson-masonry/
> 參考影片：https://www.youtube.com/watch?v=_IAFA2kA840
> (原生JS寫法我是參考影片中的做法，不過腳本我沒有用 import 方式引入，而是直接使用 CDN)
> 關鍵字搜尋：masonry overlapping images

### 套件CDN載入

網路上大多是結合 jQuery 的使用方式，但其實原生的JS一樣可以套用。

我的寫法就是原生 JS+ImageLoaded+Masonry，不需要載入 jQuery。

依照使用套件功能的順序，腳本載入順序是： axios  → imagesloaded → masonry → 自己的 JS。

```htmlembedded!
<!-- axios -->
  <script src='https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js'></script>
<!-- imagesloaded -->
  <script src="https://unpkg.com/imagesloaded@4/imagesloaded.pkgd.min.js"></script>
<!-- masonry -->
  <script src='https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js'></script>
<!-- 自己的 JS -->
 <script src="./script.js"></script>
```
 
點擊搜尋後，就執行 getData() 渲染資料，資料先透過 axios 抓回來，才呼叫 getMasonry() ，用 imagesLoaded 和 Masonry 對圖卡們進行排版。

```javascript!

getData();

function getData(){
  axios.get(endpoint)
    .then((res)=>{
      let dataArr = res.data.data;
      renderCard(dataArr);
    })
    getMasonry();
  })
    .catch((err)=>{
      console.log(err);
  });
};

// 等到 api 資料都載入進來DOM之後，才開始進行瀑布流排版
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

```

順序上是先做 `imagesLoaded` ，才做`new Masonry()`，`new Masonry()` 被包在 `imagesLoaded` 裡面。


### imagesLoaded

**參數設定**

```javascript
imagesLoaded(選擇器, 背景圖片載入對象, function(){})
```

**選擇器**：用雙引號包住 class 選擇器名稱。`".grid"` 表示是以 `class="grid"` 的元素作為圖片載入完整與否的偵測對象。

這裡的官方規定寫法長得很像 jQuery ，差別在於錢字號的有無。

**`background:true`** 偵測選擇器內所有圖片是否已載入完成。

除了設定 true ，其實也可以客製化，變成指定子元素選擇器。

以下是官網範例程式碼，`background: '.item'` 表示指定偵測對象是`'#container'` 裡面的子元素 `'.item'` 。

```javascript!
// vanilla JS
imagesLoaded( '#container', { background: '.item' }, function() {
  console.log('圖片已經全部載入！');
});
```

**`function(){}`**：表示若偵測到圖片載入完成，就開始執行 function 內的動作，masonry 就放在這裡面。

### Masonry

**參數設定**

```javascript
new Masonry(".grid",{ 
    itemSelector: ".grid-item",
    gutter: 15,
    percentPosition: true,
    columnWidth: ".grid-sizer"
    
});
    
```

- `new Masonry(選擇器,{})`：括號內第一個參數，代表要進行瀑布瀑流排版的容器選擇器名稱
- itemSelector：代表要被排版的子元素選擇器名稱。
- gutter：代表每個子元素之間水平方向的間距。15就代表15px。
- percentPosition: true 想要響應式佈局，必須在這個屬性設定 true。
- columnWidth：代表子元素 .grid-item 的寬度，可以設定數字，不用寫單位，寫 200 就代表 200px。但如果想要 RWD 響應式佈局，不能在這邊直接寫百分比，例如：25% (享均分四欄)，而是要設置為元素選擇器，再用CSS對指定元素的進行寬度百分比變化。

> 官方建議設置 columnWidth。如果 columnWidth 未設置，將使用第一個子元素的外部寬度。

舉例來說我的 HTML 結構是這樣，grid 是整個排版區域，grid-item 則是每一張圖卡，我在每一張圖卡上面新增一個 className grid-sizer，專門只用來設定寬度。

![image](https://hackmd.io/_uploads/Sy8LrIfIn.jpg)


```htmlembedded!
<section class="container grid">
    /* a元素被我設定成區塊元素 */
  <a href="#image_id_01" class="art grid-item grid-sizer">
    <div class="art__imgBox">
      <img src="https://picsum.photos/843/1800" alt="">
    </div>
  
    <h3 class="art__title">畫作名稱</h3>
    <h4 class="art__artist">作者姓名</h4>

    <ul class="art__tag">
      <li class="art__tagName">類別名稱</li>
    </ul>
  </a>
</section>
````

```css!

/* scss 變數*/

@mixin pad{
  @media(max-width:992px){
    @content;
  }
}
@mixin mobile{
  @media(max-width: 576px){
    @content;
  }
}

$container__padding: 20px;

/* 給 Masonry 定義百分比尺寸使用 */
.grid-sizer {
  width: calc((100% - (45px + $container__padding * 2)) / 4);

  @include pad{
      width: calc((100% - (15px + $container__padding * 2)) / 2)
  }
  
  @include mobile{
      width: calc((100% - $container__padding * 2) / 1)
  }  
}
```

我想要電腦版寬度時，版面均分分成4欄，且中間有 15px的 gutter。
- 四欄表示有三個 gutter，`15p*3=45px`
- 父元素 .grid 有左右 padding，所以還要加上 $container__padding * 2，
- 100%寬度減去 gutter 減去 padding，剩餘寬度除以 4 ，就是每個 grid-item 的百分比寬度。

以此類推，算出平板寬度時分為2欄，和手機寬度時只有1欄。
如此一來，參數 columnWidth 就會吃到 .grid-sizer，隨著螢幕寬度變化計算出來的 .grid-item 寬度，達成 RWD 佈局。

圖卡垂直的距離則是單純使用 `margin-bottom` 設定即可。


![image](https://hackmd.io/_uploads/SJyU_vzL2.jpg)



### lightbox 燈箱模式顯示圖卡
點擊作品圖卡會進入燈箱模式，跳出完整的圖片，圖片點擊後會另開新分頁顯示大圖。

這次的燈箱顯示方式參考 [Kevin Powell](https://www.youtube.com/watch?v=6j5q-hP8sfk) 的純CSS寫法。

是利用 a 元素點擊超連結跳轉的特性，類似單頁式網頁那樣，點擊後就跳到對應 id 的 lightbox 區域，沒有點擊時 lightbox 則藏在頁面上待命。

把 a 元素轉成區塊元素，把圖卡資料放裡面，超連結網址設定同一張圖片的 id 名稱 href="id名稱"。

```htmlembedded!

<a href="#image_id_01" class="art grid-item grid-sizer">
    <div class="art__imgBox"></div>
</a>

/* 燈箱 id 要跟上面一樣 */
<div class="lightbox">
    <div class="lightbox__wrap" id="#image_id_01">
      <div class="lightbox__item">
          <a href="#/" class="close"></a>
        </div>
    </div>
</div>`
    
```

這個燈箱做法的特色就是一直利用 a 標籤的超連結的跳轉，關閉按 X 按鈕其實不是真的關掉，而是跳到 href 指定的路徑或是區塊，如果路徑填寫 `#`，每次關閉時都會跳回到頁面頂端，當作品牆滑到比較下面時，瞬間跳回頂端其實對使用者不友善。


後來搜尋到的解套辦法是寫成 `#/`，這個寫法其實並沒有特殊意義，目的只是讓瀏覽器找不到要跳轉的區塊因而使頁面留在原地而已，引號內寫什麼都可以 `#whateveryouwant` 。但也有人提到這種寫法可能有語意上的誤會。

或許不是最理想的解決方式，但至少，以目前頁面需要的功能來說，it works。

參考文章：[How can I prevent a click on a '#' link from jumping to top of page?](https://stackoverflow.com/questions/3252730/how-can-i-prevent-a-click-on-a-link-from-jumping-to-top-of-page)

這件串接博物館 API 的圖庫搜尋 Demo ，或許還有很多可以更精緻的部分，不過它是我第一次從無到有實踐出來的 API 實作，嘗試理解文件、遇到各種意料之外的問題、找適用的解方等等，記錄下來，也許對網路上的某個人也會有幫助！