const fs = require('fs');
const path = require('path');

// artworks 폴더 경로
const artworksDir = path.join(__dirname, 'artworks');

// 결과를 저장할 배열
const contentArray = [];

// HTML 템플릿 함수
function generateHTML(artwork) {
  const mediaElements = artwork.media.map(file => {
    const ext = path.extname(file).toLowerCase();
    const filePath = `./${file}`;
    
    if (['.mp4', '.mov', '.webm', '.avi', '.mkv'].includes(ext)) {
      let mimeType;
      switch(ext) {
        case '.mp4':
          mimeType = 'video/mp4';
          break;
        case '.mov':
          mimeType = 'video/quicktime';
          break;
        case '.webm':
          mimeType = 'video/webm';
          break;
        case '.avi':
          mimeType = 'video/x-msvideo';
          break;
        case '.mkv':
          mimeType = 'video/x-matroska';
          break;
        default:
          mimeType = 'video/mp4';
      }
      
      return `<video controls preload="metadata" style="max-width: 100%; margin: 10px 0;">
        <source src="${filePath}" type="${mimeType}">
        <p>브라우저가 이 비디오 형식을 지원하지 않습니다. <a href="${filePath}">비디오 다운로드</a></p>
      </video>`;
    } else {
      return `<img src="${filePath}" alt="${file}" style="max-width: 100%; margin: 10px 0;">`;
    }
  }).join('\n');

  const linkElements = artwork.links && artwork.links.length > 0 
    ? artwork.links.map((link, index) => 
        `<p><a href="${link.url}" target="_blank">${link.title}</a></p>`
      ).join('\n')
    : '';

  const thumbnailElement = artwork.thumbnail 
    ? `<img src="./${artwork.thumbnail}" alt="썸네일" style="max-width: 300px; margin-bottom: 20px;">`
    : '';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${artwork.title}</title>
     <style>
@import url('https://fonts.googleapis.com/css2?family=Gothic+A1:wght@300;400;500;600;700;800;900&family=Noto+Sans+KR:wght@100..900&display=swap');
</style>
    <style>
    *{
    overscroll-behavior: none;
     font-family: "Gothic A1", sans-serif;
  font-weight: 400;
  margin: 0;
  padding: 0;
  font-style: normal;}
        body {
            font-family: 'Arial', sans-serif;
            margin: 0 auto;
            padding-left: 20px;
            padding-right: 20px;
            line-height: 1.6;
            padding-top: 100px;
        }
       
        h1 {
            font-size: 18px;
            color: #333;
            padding-bottom: 10px;
            font-weight: 600;
            font-style: italic;
        }
        .subtitle{
           padding-top: 40px;
        }
        .description {
            border-radius: 5px;
            white-space: pre-wrap;
            font-size: 14px;
        }
        .media-section {
            margin: 20px 0;
            display: flex;
            flex-direction: column;
            align-items: start;
            justify-content: start;
        }
        .links-section {
        padding-top: 100px;
        font-size: 14px;
        }

          .logo{
            font-size: 14px;
            font-weight: 600;
            font-style: italic;
            font-weight: bold;
             margin-bottom: 100px;
          }


       .subtitle{
            font-size: 14px;
            font-weight: 600;
            font-style: italic;
            font-weight: bold;
        }




           @media screen and (min-width: 800px) {
             body {
            padding: 40px;
        }

      .content-wrapper{
        display: flex;
        flex-direction: row-reverse;
        align-items: start;
        justify-content: start;
        gap: 20px;
      }
      .media-section{
        width: 44vw;
       
      }
      .description{
        width: 44vw;
        background-color:rgb(255, 255, 255);
        overflow: hidden;
        height: 100vh;
           font-size: 16px;
        padding-bottom: 100px;
      }
}
    </style>
</head>
<body>

      <a class="logo" href="../../index.html">
      back
      </a>

    <p class="subtitle">${artwork.title}</p>
    
    <!-- ${thumbnailElement} -->
    
    <div class="content-wrapper">
        <div class="media-section">
            ${mediaElements}
        </div>
        
        ${artwork.text ? `<div class="description">${artwork.text}</div>` : ''}
    </div>
    
    ${linkElements ? `<div class="links-section">
        <p class="subtitle">Annotation</p>
        ${linkElements}
    </div>` : ''}
</body>
</html>`;
}

// artworks 폴더 읽기
const folders = fs.readdirSync(artworksDir)
  .filter(item => fs.statSync(path.join(artworksDir, item)).isDirectory())
  .sort(); // 폴더 이름 기준 정렬

// 각 작품 폴더 처리
folders.forEach(folder => {
  const folderPath = path.join(artworksDir, folder);
  
  // 폴더 내용 읽기
  const folderContents = fs.readdirSync(folderPath);
  
  // 제목 추출 (1_title → title)
  const title = folder.split('_').slice(1).join('_');
  
  // 썸네일 찾기 (thumbnail.png, thumnail.png 등)
  let thumbnail = '';
  const thumbnailFiles = folderContents.filter(file => {
    const name = file.toLowerCase();
    return (name.includes('thumbnail') || name.includes('thumnail')) && 
           ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(path.extname(file).toLowerCase());
  });
  if (thumbnailFiles.length > 0) {
    thumbnail = thumbnailFiles[0];
  }

  // 미디어 파일 찾기 (순번_이름 형식)
  const media = folderContents.filter(file => {
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file, ext);
    // 순번_이름 패턴 확인
    const isNumbered = /^\d+_/.test(name);
    const isMediaFile = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.webm', '.avi', '.mkv', '.bmp', '.tiff', '.svg'].includes(ext);
    return isNumbered && isMediaFile;
  }).sort(); // 순번 기준 정렬

  // description.txt 읽기
  let text = '';
  if (folderContents.includes('description.txt')) {
    text = fs.readFileSync(path.join(folderPath, 'description.txt'), 'utf8');
  }

  // link 파일들 찾기 (link_순번_이름.txt)
  const linkFiles = folderContents.filter(file => 
    file.startsWith('link_') && file.endsWith('.txt')
  );
  
  const links = linkFiles.map(file => {
    const content = fs.readFileSync(path.join(folderPath, file), 'utf8').trim();
    // link_순번_이름.txt에서 이름 부분 추출
    const namePart = file.replace('link_', '').replace('.txt', '');
    const linkTitle = namePart.split('_').slice(1).join('_'); // 순번 제거하고 이름만
    
    return {
      title: linkTitle,
      url: content
    };
  });

  // 작품 정보 객체 생성
  const artwork = {
    title,
    folder,
    thumbnail,
    media,
    text,
    links
  };
  
  // HTML 파일 생성
  const htmlContent = generateHTML(artwork);
  const htmlFileName = `${title}.html`;
  fs.writeFileSync(
    path.join(folderPath, htmlFileName),
    htmlContent,
    'utf8'
  );
  
  console.log(`${htmlFileName} 파일이 생성되었습니다.`);
  
  // 배열에 추가
  contentArray.push(artwork);
});

// content.json 파일로 저장
fs.writeFileSync(
  path.join(__dirname, 'content.json'),
  JSON.stringify(contentArray, null, 2),
  'utf8'
);

console.log('content.json 파일이 생성되었습니다.');