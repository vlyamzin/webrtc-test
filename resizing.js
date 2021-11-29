const contentWidth = 1024;
const contentHeight = 768;
let scale = 0
const sdk_container = document.querySelector('#player')
const iFrame = document.querySelector('#iframe-01')
const iFrameWrapper = document.querySelector('#iFrame-wrapper')
function isVertical() {
  return (window.innerWidth / window.innerHeight) < (contentWidth / contentHeight);
}

function refreshContentSize(){

  let margin;

    console.log(sdk_container, iFrame , contentWidth > 0 , contentHeight > 0)
  if (sdk_container && iFrame && contentWidth > 0 && contentHeight > 0) {
    if (isVertical()) {
      scale = (window.innerWidth / contentWidth);
      scale = (scale * 100) / 100;
      margin = (window.innerHeight - (contentHeight * scale)) / 2;

      iFrame.style.width = contentWidth + 'px';
      iFrame.style.height = contentHeight + 'px';

      iFrameWrapper.style.width = contentWidth + 'px';
      iFrameWrapper.style.height = contentHeight + 'px';
      iFrameWrapper.style.transform = 'scale(' + scale + ')';
      iFrameWrapper.style.left = 0;
      iFrameWrapper.style.top = 0;
      iFrameWrapper.style.position = 'absolute';

      sdk_container.style.width = '100%';
      sdk_container.style.height = iFrame.getBoundingClientRect().height + 'px';
      sdk_container.style.top = margin + 'px';
      sdk_container.style.left = 0;
      sdk_container.style.transform = 'none';
      sdk_container.style.position = 'absolute';
    } else {
      scale = (window.document.documentElement.clientHeight / contentHeight);
      scale = (scale * 100) / 100;
      margin = (window.innerWidth - (contentWidth * scale)) / 2;

      sdk_container.style.width = '100%';
      sdk_container.style.height = window.document.documentElement.clientHeight + 'px';
      sdk_container.style.top = 0;
      sdk_container.style.left = 0;
      sdk_container.style.transform = 'none';
      sdk_container.style.position = 'absolute';
      sdk_container.style.overflow = 'hidden';

      iFrame.style.width = contentWidth + 'px';
      iFrame.style.height = contentHeight + 'px';

      iFrameWrapper.style.width = contentWidth + 'px';
      iFrameWrapper.style.height = contentHeight + 'px';
      iFrameWrapper.style.transform = 'scale(' + scale + ')';
      iFrameWrapper.style.left = margin + 'px';
      iFrameWrapper.style.top = 0;
      iFrameWrapper.style.position = 'absolute';
    }

  }
}



window.addEventListener('resize' , refreshContentSize)