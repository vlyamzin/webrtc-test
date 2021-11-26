/**
 * @author mbourdon
 *
 */
 
var IframeControl = function(_options){
    var m_self = this;
	
    //event
    this.listeners = {};
	
    //options
    this.options = typeof(_options) != "undefined" ? _options : {};
    this.options.containerId = typeof(this.options.containerId) != "undefined" ? this.options.containerId : "iframe-container";
    this.options.showHideClass = typeof(this.options.showHideClass) != "undefined" ? this.options.showHideClass : "layer-off";
    this.options.autoDisplay = typeof(this.options.autoDisplay) != "undefined" ? this.options.autoDisplay : false;
	
    this.options.iframeId = typeof(this.options.iframeId) != "undefined" ? this.options.iframeId : "iframe";
    this.options.iframeShowHideClass = typeof(this.options.iframeShowHideClass) != "undefined" ? this.options.iframeShowHideClass : "layer-off";
    this.options.openBtnId = typeof(this.options.openBtnId) != "undefined" ? this.options.openBtnId : "open-iframe-btn";
    this.options.closeBtnId = typeof(this.options.closeBtnId) != "undefined" ? this.options.closeBtnId : "close-iframe-btn";
	
    this.options.loadingContainerId = typeof(this.options.loadingContainerId) != "undefined" ? this.options.loadingContainerId : "iframe-loading";
    this.options.loadingShowHideClass = typeof(this.options.loadingShowHideClass) != "undefined" ? this.options.loadingShowHideClass : "off";
	
	
    this.options.delayShowIframe = typeof(this.options.delayShowIframe) != "undefined" ? this.options.delayShowIframe : 0;
	
    this.options.prevBtnContainerId = typeof(this.options.prevBtnContainerId) != "undefined" ? this.options.prevBtnContainerId : "iframe-prevBtnId";
    this.options.prevBtnShowHideClass = typeof(this.options.prevBtnShowHideClass) != "undefined" ? this.options.prevBtnShowHideClass : "layer-off";
    this.options.nextBtnContainerId = typeof(this.options.nextBtnContainerId) != "undefined" ? this.options.nextBtnContainerId : "iframe-nextBtnId";
    this.options.nextBtnShowHideClass = typeof(this.options.nextBtnShowHideClass) != "undefined" ? this.options.nextBtnShowHideClass : "layer-off";
    this.options.navEnabled = typeof(this.options.navEnabled) != "undefined" ? this.options.navEnabled : true;
	
	
	
    //data
    this.view;
    this.loadingView;
    this.iframeView;
    this.displayed;
    this.currentPageIndex;
	
    this.navPrevView;
    this.navNextView;
	
    //events handlers
    this.onIframeLoadedHandler = function(_event){
        if(typeof(m_self.fire) == 'function'){
            m_self.fire('LoadedEvent');	
        }
        if(!m_self.displayed){
            setTimeout(function(){
                m_self.showIframe();
            }, m_self.options.delayShowIframe);
			
        //m_self.show();
        }
    }
	
    this.onOpenIframeHandler = function(_event){
        if(typeof(m_self.fire) == 'function'){
            m_self.fire('OpenEvent');	
        }
        m_self.open();
    }
    this.onCloseIframeHandler = function(_event){
        if(typeof(m_self.fire) == 'function'){
            m_self.fire('CloseEvent');	
        }
        m_self.close();
    }
	
    //nav
    this.onNavPrevClickHandler = function(_event){
        console.log("IframeControl::onNavPrevClickHandler()");	
        if(m_self.options.navEnabled){
            m_self.gotoPrevPage();
        }
    }
    this.onNavNextClickHandler = function(_event){
        console.log("IframeControl::onNavNextClickHandler()");	
        if(m_self.options.navEnabled){
            m_self.gotoNextPage();
        }
    }
}
IframeControl.prototype = {
    initialize: function(_pages){
        console.log("IframeControl::initialize()");	
		
        if(typeof(_pages) == "object"){
            this.setPages(_pages);
        } else if(typeof(_pages) == "string"){
            this.setPages([_pages]);
        }
		
        this.view = document.getElementById(this.options.containerId);
        if(!this.view){
            throw "IframeControl no view container ('" + this.options.containerId + "')";
        }
        this.loadingView = document.getElementById(this.options.loadingContainerId);
        if(!this.loadingView){
            throw "IframeControl no loadingView container ('" + this.options.loadingContainerId + "')";
        }
		
        this.iframeView = document.getElementById(this.options.iframeId);
        if(!this.iframeView){
            throw "IframeControl no iframeView ('" + this.options.iframeId + "')";
        }
		
        this.openIframeBtnView = document.getElementById(this.options.openBtnId);
        if(this.openIframeBtnView){
            $(this.openIframeBtnView).click(this.onOpenIframeHandler)	
        }
        this.closeIframeBtnView = document.getElementById(this.options.closeBtnId);
		
        if(this.closeIframeBtnView){
            $(this.closeIframeBtnView).on(Tools.getEventsString("click"), this.onCloseIframeHandler)	
        }
		
        this.navPrevView = document.getElementById(this.options.prevBtnContainerId);
        if(this.navPrevView){
            $(this.navPrevView).click(this.onNavPrevClickHandler)	
        }
        this.navNextView = document.getElementById(this.options.nextBtnContainerId);
        if(this.navNextView){
            $(this.navNextView).click(this.onNavNextClickHandler)	
        }
		
        this.iframeView.onload = this.onIframeLoadedHandler;
        this.currentPageIndex = 0;
        if(this.options.autoDisplay == true){
            this.open();
        }
    },
    setPages: function(_pages){
        this.pages = _pages;
    },
    getTotalPage: function(){
        return typeof(this.pages) == "object" && this.pages != null ? this.pages.length : 0;
    },
    gotoPageFromId: function(_pageId){
        console.log("gotoPageFromId('" + _pageId + "')");
        var index = this.getPageIndex(_pageId);
        this.gotoPage(index);	
    },
    gotoPage: function(_pageIndex){
        console.log("gotoPage('" + _pageIndex + "')");
        this.hideBtns();
        this.currentPageIndex = _pageIndex;
        if(typeof(this.fire) == 'function'){
            this.fire({
                type: "PageIndexChangeEvent", 
                index: this.currentPageIndex
                });
        }
        var pageUrl = typeof(this.pages[_pageIndex]) == "string" ? this.pages[_pageIndex] : null;
        if(pageUrl != null){
            this.displayPage(pageUrl);
        } else {
            console.error("IFrameControl error pageUrl undefined");	
        }
    },
    displayPage: function(_pageUrl){
        console.log("IframeControl::setPageUrl('" + _pageUrl + "')");
        this.hideIframe();
        this.show();
        $(this.iframeView).attr('src', _pageUrl);
    },
    gotoPrevPage: function(){
        var index = parseInt(this.currentPageIndex, 10) - 1;
        console.log("IframeControl::gotoPrevPage( ('" + index + "'))");
        if(index >= 0){
            this.gotoPage(index);
        }
    },
    gotoNextPage: function(){
        var index = parseInt(this.currentPageIndex, 10) + 1;
        console.log("IframeControl::gotoNextPage( ('" + index + "'))");
        if(index <= this.getTotalPage()- 1){
            this.gotoPage(index);
        }
    },
    show: function(){
        //this.displayed = true;
        this.showLoading();
        $(this.view).removeClass(this.options.showHideClass);
    },
    hide: function(){
        //this.displayed = false;
        $(this.view).addClass(this.options.showHideClass);
    },
    showIframe: function(){
        this.displayed = true;
        this.hideLoading();
        $(this.iframeView).removeClass(this.options.iframeShowHideClass);		
        this.updateNav();
    },
    hideIframe: function(){
        this.displayed = false;
        $(this.iframeView).addClass(this.options.iframeShowHideClass);
    },
    showLoading: function(){
        $(this.loadingView).removeClass(this.options.loadingShowHideClass);
    },
    hideLoading: function(){
        this.displayed = false;
        $(this.loadingView).addClass(this.options.loadingShowHideClass);
    },
    showNextBtn: function(){
        if(this.navNextView){
            $(this.navNextView).removeClass(this.options.nextBtnShowHideClass);
        }
    },
    hideNextBtn: function(){
        if(this.navNextView){
            $(this.navNextView).addClass(this.options.nextBtnShowHideClass);
        }
    },
    showPrevBtn: function(){
        if(this.navPrevView){
            $(this.navPrevView).removeClass(this.options.prevBtnShowHideClass);
        }
    },
    hidePrevBtn: function(){
        if(this.navPrevView){
            $(this.navPrevView).addClass(this.options.prevBtnShowHideClass);
        }
    },
    hideBtns: function(){
        this.hideNextBtn();
        this.hidePrevBtn();
    },
    updateNav: function(){
        if(this.options.navEnabled){
            if(this.currentPageIndex <= 0){
                this.hidePrevBtn();
            } else {
                this.showPrevBtn();
            }
            if(this.currentPageIndex >= this.getTotalPage() - 1){
                this.hideNextBtn();
            } else {
                this.showNextBtn();
            }
        } else {
            this.hidePrevBtn();
            this.hideNextBtn();		
        }
    },
    open: function(){
        this.gotoPage(this.currentPageIndex);
    },
    close: function(){
        this.hide();
        this.hideBtns();
        //this.hideIframe();
    },
    applyMethod: function(_methodName, _params){
        console.log("IframeControl::applyMethod('" + _methodName + "')");	
        if(typeof(this.fire) == 'function'){
            this.fire({
                type: 'ApplyMethodEvent', 
                methodName: _methodName, 
                params: _params
            });
        }
    }
}
if(typeof(Tools) == "object" && typeof(Tools.makeClassEventDispatcher) == "function"){
    Tools.makeClassEventDispatcher(IframeControl);
}