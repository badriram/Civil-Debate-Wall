
if(window.models===undefined){window.models={}}
window.StatsScreenView=Backbone.View.extend({tagName:'div',className:'stats-view',template:_.template($('#stats-screen-template').html()),events:{'click a.close-btn':'onCloseClick',},initialize:function(){$('div.stats-outer').append($(this.render().el));var data=this.model.toJSON();window.StatsMostDebated=new StatsMostDebatedView({el:$('div.most-debated'),model:new Backbone.Collection(data.mostDebatedOpinions)});window.StatsFrequentWords=new StatsFrequentWordsView({el:$('div.frequent-words'),model:new Backbone.Collection(data.frequentWords)});this.$('div.screen').hide();this.gotoScreen('screen-1');},render:function(){var data=this.model.toJSON();$(this.el).html(this.template(data));var totalAnswers=data.debateTotals.yes+data.debateTotals.no;var yesWidth=Math.floor(100*(data.debateTotals.yes/totalAnswers));var noWidth=100-yesWidth;this.$('div.opinions-bar .yes-bar').css({width:yesWidth+'%'});this.$('div.opinions-bar .no-bar').css({width:noWidth+'%'});if(yesWidth<=noWidth){this.$('div.yes-bar img').hide();}
if(noWidth<=yesWidth){this.$('div.no-bar img').hide();}
this.$('ul.stats-menu a').click($.proxy(function(e){e.preventDefault();console.log($(e.currentTarget));this.gotoScreen($(e.currentTarget).attr('class'));},this));return this},onNav:function(e){e.preventDefault();console.log($(e.currentTarget));this.gotoScreen($(e.currentTarget).attr('class'));},onCloseClick:function(e){e.preventDefault();this.remove();},gotoScreen:function(screen){if(this.$currentScreen){this.$currentScreen.hide();this.$('ul.stats-menu li.'+this.currentScreen).toggleClass('selected');}
this.currentScreen=screen;this.$currentScreen=this.$('div.'+screen);this.$('ul.stats-menu li.'+screen).toggleClass('selected');this.$currentScreen.show();},})
window.StatsMostDebatedDetailView=Backbone.View.extend({tagName:'li',template:_.template($('#stats-most-debated-detail-template').html()),render:function(){var data=this.model.toJSON();data.qid=models.currentQuestion.id;data.raggedText=tools.ragText(data.firstPost.text,40);$(this.el).html(this.template(data));$(this.el).addClass('item-'+this.model.get('rank'));var yesNo=(data.firstPost.yesNo==0)?'no':'yes'
$(this.el).addClass(yesNo);return this;}});window.StatsMostDebatedMenuView=Backbone.View.extend({tagName:'li',template:_.template($('#stats-most-debated-menu-template').html()),render:function(){var data=this.model.toJSON();var selector='item-'+this.model.get('rank');$(this.el).html(this.template(data));$(this.el).addClass(selector);$(this.el).data('selector',selector);return this;}});window.StatsMostDebatedView=Backbone.View.extend({initialize:function(){this.addAll();this.$('div.detail-view li').hide();this.$('div.menu-view li').click($.proxy(function(e){this.setSelection($(e.currentTarget).data('selector'));},this));this.setSelection('item-1');},addAll:function(){this.model.each(this.addOne,this);},addOne:function(item,index){item.set({rank:index+1});var view=new StatsMostDebatedDetailView({model:item});this.$('div.detail-view ul').append(view.render().el);view=new StatsMostDebatedMenuView({model:item});this.$('div.menu-view ul').append(view.render().el);},setSelection:function(itemSelector){if(this.currentSelector==itemSelector)return;if(this.$currentSelection){var item=this.model.at(this.currentIndex)
var yesNo=(item.get('firstPost').yesNo==0)?'no':'yes';this.$currentSelection.removeClass('selected-'+yesNo)
this.$('div.detail-view li.'+this.currentSelector).hide();}
var index=itemSelector.charAt(itemSelector.length-1)
this.currentSelector=itemSelector;this.currentIndex=index-1;var item=this.model.at(this.currentIndex);var yesNo=(item.get('firstPost').yesNo==0)?'no':'yes';this.$currentSelection=this.$('div.menu-view li.'+this.currentSelector);this.$currentSelection.addClass('selected-'+yesNo)
this.$('div.detail-view li.'+this.currentSelector).show();},});window.StatsFrequentWordsView=Backbone.View.extend({events:{'click a.back-btn':'showWordMenu',},initialize:function(){this.detailPosts=[];this.render();},render:function(){this.dRow=0;this.allButtons=[];this.model.each(this.addWordBtn,this);$.each($('div.word-row'),function(index,item){var $item=$(item);$item.css('top',index*66);var width=0;$.each($('button',item),function(i,btn){width+=$(btn).outerWidth();});$item.width(width+60);});this.$('button').click($.proxy(function(e){e.preventDefault();this.showWordDetail($(e.currentTarget).data('index'));},this)).mouseover($.proxy(function(e){e.preventDefault();var index=$(e.currentTarget).data('index');for(var i=0;i<this.allButtons.length;i++){if(index!=i){this.allButtons[i].css('opacity',0.5);}}},this)).mouseout($.proxy(function(e){e.preventDefault();for(var i=0;i<this.allButtons.length;i++){this.allButtons[i].css('opacity',1);}},this));this.$('div.word-detail').hide();return this;},addWordBtn:function(item,index){var colors=['#68b7fd','#5191d5','#457ec1','#3767a9','#3a546c','#3f3c4d','#6c4434','#8a4d29','#c8611d','#e0681c']
var cIndex=9-Math.round(item.get('ratio')*9);var $btn=$('<button class="word-btn">'+item.get('word')+'</button>');$btn.css('background-color',colors[cIndex]);$btn.data('index',index);var $row=$(this.$('div.word-row')[this.dRow]);$row.append($btn);this.dRow=(this.dRow==3)?0:this.dRow+1;this.allButtons.push($btn);},showWordMenu:function(e){e.preventDefault();_.each(this.detailPosts,function(item){item.remove()})
this.detailPosts=[];this.$('div.word-detail').hide();this.$('div.word-menu').show();},showWordDetail:function(index){this.$('div.word-menu').hide();this.$('div.word-detail').show();var model=this.model.at(index);var posts=model.get('posts');for(var i=0;i<posts.length;i++){var view=new ResponseItemView({model:new Backbone.Model(posts[i])});this.detailPosts.push(view);this.$('div.responses-list').append(view.render().el);}
$(this.el).height(Math.max(354,$('div.responses-list').height()));},});tools.ragText=function(text,maxChars){var formattedText=''
var first=true;while(text.length>0){var q1=(first)?'“':'';lineBreak=this.getNextLine(text,maxChars);formattedText+='<div>'+q1+$.trim(text.substr(0,lineBreak));text=text.substring(lineBreak,text.length);var q2=(text.length==0)?'”':'';formattedText+=q2+"</div>";first=false;}
return formattedText;}
tools.getNextLine=function(text,maxChars){if(text.length<=maxChars){return(text==" ")?0:text.length;}
var spaceLeft=maxChars;for(var i=maxChars;i>0;i--){if(text.charAt(i)==" "){spaceLeft=maxChars-i;break;}}
return maxChars-spaceLeft;}
window.SpinnerView=Backbone.View.extend({tagName:'div',className:'popup spinner-popup',template:_.template($('#spinner-popup-template').html()),render:function(){$(this.el).html(this.template());return this;}});window.WhatIsThisView=Backbone.View.extend({tagName:'div',className:'whatisthis',template:_.template($('#what-is-this-template').html()),events:{'click li a':'onNavClick',},render:function(){var data={qid:models.currentQuestion.id,did:models.currentDebate.id}
$(this.el).html(this.template(data));this.$('div.contents div').hide();this.$('div.contents div.screen-1').show();this.currentScreen="screen-1";return this;},onNavClick:function(e){e.preventDefault();this.showScreen($(e.currentTarget).attr('class'));},showScreen:function(selector){this.$('div.contents div.'+this.currentScreen).hide();this.currentScreen=selector;this.$('div.contents div.'+this.currentScreen).show();}});window.BrowseMenuItemView=Backbone.View.extend({tagName:'div',className:'browse-menu-item',template:_.template($('#browse-menu-item-template').html()),render:function(){var data=this.model.toJSON();data.qid=models.currentQuestion.id;data.answer=(data.firstPost.yesNo==0)?'NO':'YES'
data.username=(data.firstPost.author.username.length>10)?data.firstPost.author.username.substr(0,8)+"...":data.firstPost.author.username
$(this.el).html(this.template(data));$(this.el).addClass((data.firstPost.yesNo==0)?'no':'yes');return this},})
window.BrowseMenuView=Backbone.View.extend({tagName:'div',className:'browse-menu',template:_.template($('#browse-menu-template').html()),events:{'click a.more-btn':'onMoreClick','click a.close-btn':'onCloseClick','click li a':'onSortButtonClick',},initialize:function(){this.model.bind('reset',$.proxy(this.addAll,this));},render:function(){$(this.el).html(this.template());$(this.el).height(650);this.reset('recent');var qH=$('div.question').height();this.$('div.sort-menu').css('top',78+qH);$(this.el).css('padding-top',qH);$('div.responses-outer').click(function(e){if($(e.target).hasClass('responses-outer')){window.location.href='/#/questions/'+models.currentQuestion.id+'/debates/'+models.currentDebate.id;}});return this;},onSortButtonClick:function(e){e.preventDefault();if(this.sort==$(e.currentTarget).attr('title'))return;this.reset($(e.currentTarget).attr('title'))},onCloseClick:function(e){e.preventDefault();window.location.href='/#/questions/'+models.currentQuestion.id+'/debates/'+models.currentDebate.id},onMoreClick:function(e){e.preventDefault();this.nextPage();},reset:function(sort){_.each(this.allItems,function(view){view.remove();});this.$('li a').removeClass('selected');this.$('li a[title='+sort+']').addClass('selected');this.allItems=[]
this.page=-1;this.limit=36;this.sort=sort;this.nextPage();$('body').scrollTop(0);},nextPage:function(){this.page+=1;this.setModelUrl(this.page,this.limit,this.sort);this.$('img.spinner').show();this.$('a.more-btn').hide();this.$('.more').show();this.model.fetch({success:$.proxy(function(data){this.$('img.spinner').hide();var bottom=62;if(data.length>=this.limit){this.$('a.more-btn').show();}else{this.$('.more').hide();bottom=27;}
$(this.el).height(Math.max(650,this.$('.menu-items').height()+
this.$('.sort-menu').height()+
this.$('.move').height()+
bottom));$('div.content-inner').height($('div.responses-outer').height()+120);},this)});},setModelUrl:function(page,amt,sort){this.model.url='/api/questions/'+models.currentQuestion.id+'/threads?page='+page+'&amt='+amt+'&sort='+sort;},addAll:function(){this.model.each(this.addOne,this);},addOne:function(item,index){var view=new BrowseMenuItemView({model:item});this.$('div.menu-items').append(view.render().el);this.allItems.push(view);},getPage:function(page,amt,sort){this.setModelUrl(page,amt,sort);this.model.fetch({success:function(data){}})},});window.JoinDebateView=Backbone.View.extend({tagName:'div',className:'join-debate',template:_.template($('#join-debate-template').html()),events:{"click button.next":"nextStep","click button.prev":"prevStep","click button.yes":"setYes","click button.no":"setNo","click a.close-btn":"onCloseClick","click button.add":"setAdd","click button.reply":"setReply",'keyup textarea':'onKeyUpReply','keydown textarea':'onKeyUpReply','blur textarea':'onKeyUpReply','submit form':'onSubmit','click button.share-btn':'shareClick',},initialize:function(){this.currentStep=0;},render:function(){var data=this.model.toJSON();data.question=models.currentQuestion.get('text');$(this.el).html(this.template(data));this.gotoStep(1);this.$ta=this.$('textarea');this.charsLeft();return this},onCloseClick:function(e){e.preventDefault();this.remove();},setYes:function(e){this.$('form input[name=yesno]').attr('value',1);this.$('form span.yes').removeClass('unselected');this.$('form span.no').addClass('unselected');},setNo:function(e){this.$('form input[name=yesno]').attr('value',0);this.$('form span.yes').addClass('unselected');this.$('form span.no').removeClass('unselected');},configureForm:function(action,callback){this.$('form').attr('action',action);this.onComplete=callback;},setAdd:function(e){this.mode='add';this.configureForm('/api/questions/'+models.currentQuestion.id+'/threads',function(data){models.currentDebates.add(data);window.location.href='/#/questions/'+models.currentQuestion.id+'/debates/'+data.id;this.remove();});},setReply:function(e){this.mode='reply';this.configureForm('/api/threads/'+models.currentDebate.id+'/posts',function(data){window.location.href='/#/questions/'+models.currentQuestion.id+'/debates/'+models.currentDebate.id+'/posts';this.remove();});},nextStep:function(e){if(e)e.preventDefault();this.gotoStep(this.currentStep+1);},prevStep:function(e){if(e)e.preventDefault();this.gotoStep(this.currentStep-1);},gotoStep:function(step){if(this.currentStep==step)return;this.$('div.step-'+this.currentStep).hide();this.currentStep=step;this.$('div.step-'+this.currentStep).css({'display':'block'});},onKeyUpReply:function(e){if(this.$ta.val().length>140){this.$ta.val(this.$ta.val().slice(0,140));}
this.charsLeft();},charsLeft:function(){this.$('div.chars-left span').text(140-this.$ta.val().length)},finish:function(data){this.$('div.question-header h3').hide();this.$('div.question-header h4').hide();this.data=data;if(this.mode=='add'){var did=this.data.id;this.$('a.view-opinion').text('View Your Opinion');}else{var did=models.currentDebate.id;this.$('a.view-opinion').text('Back to Debate');}
this.$('a.view-opinion').attr('href','/questions/'+models.currentQuestion.id+'/debates/'+did);this.nextStep();},onSubmit:function(e){e.preventDefault();var $form=this.$('form');var data=$form.serialize();$.ajax({url:$form.attr('action'),type:'POST',data:data,dataType:'json',complete:$.proxy(function(data){},this),error:$.proxy(function(e,xhr){var d=$.parseJSON(e.responseText);this.$ta.val('');window.alert(d.error);},this),success:$.proxy(function(data){this.finish(data);},this),});},shareClick:function(e){e.preventDefault();var provider=$(e.currentTarget).attr('title');var did=(this.mode=='add')?this.data.id:models.currentDebate.id
var url="/share/"+provider+"/"+did;window.open(url);},});window.ReplyView=Backbone.View.extend({tagName:'div',className:'reply',template:_.template($('#reply-template').html()),events:{'click .close-btn':'close','click .skip-btn':'close','submit form':'onSubmit','click button.yes':'onSetYes','click button.no':'onSetNo','keyup textarea':'onKeyUpReply','keydown textarea':'onKeyUpReply','blur textarea':'onKeyUpReply','click button.share-btn':'shareClick',},initialize:function(){this.currentStep=0},close:function(e){e.preventDefault();$('div.responses').show();commands.refreshResponsesHeight();this.remove();},render:function(){var data=this.model.toJSON();data.qid=models.currentQuestion.id;data.did=models.currentDebate.id;data.raggedText=tools.ragText(data.text,52);$(this.el).html(this.template(data));this.$ta=this.$('textarea');this.charsLeft();this.$('div.response-to').addClass((data.yesNo==1)?'yes':'no');this.$('div.screen').hide();this.$('div.screen-1').show();return this;},onKeyUpReply:function(e){this.$ta.val(this.$ta.val().slice(0,140));this.charsLeft();},charsLeft:function(){this.$('div.chars-left span').text(140-this.$ta.val().length)},onSetYes:function(e){e.preventDefault();this.answer=1;this.$('button.no').addClass('unselected');this.$('button.yes').removeClass('unselected');},onSetNo:function(e){e.preventDefault();this.answer=0;this.$('button.yes').addClass('unselected');this.$('button.no').removeClass('unselected');},shareClick:function(e){e.preventDefault();var provider=$(e.currentTarget).attr('title');var url="/share/"+provider+"/"+models.currentDebate.id;window.open(url);},onSubmit:function(e){e.preventDefault();this.showShareScreen();var $form=this.$('form');this.$('form input[name=origin]').attr('value','web');this.$('form input[name=yesno]').attr('value',this.answer);var data=$form.serialize();$.ajax({url:$form.attr('action'),type:'POST',data:data,dataType:'json',complete:$.proxy(function(data){},this),error:$.proxy(function(e,xhr){var d=$.parseJSON(e.responseText);this.$ta.val('');window.alert(d.error);},this),success:$.proxy(function(data){models.currentPosts.add(data);models.currentDebate.get('posts').push(data);models.currentDebate.change();this.showShareScreen();},this),});},showShareScreen:function(){this.$('div.screen-1').hide();this.$('div.screen-2').show();},onResize:function(e){}});window.ResponseItemView=Backbone.View.extend({tagName:'div',className:'response-item',template:_.template($('#responses-item-template').html()),events:{'click a.reply-btn':'onReplyClick','click a.flag':'flag',},render:function(){var data=this.model.toJSON();data.answer=(data.yesNo==1)?'YES':'NO'
data.raggedText=tools.ragText(data.text,50);$(this.el).html(this.template(data));$(this.el).addClass((data.yesNo==1)?'yes':'no');return this;},onReplyClick:function(e){e.preventDefault();commands.showReplyScreen(this.model);},flag:function(e){e.preventDefault();commands.flagPost(this.model.get('id'));}});window.ResponsesView=Backbone.View.extend({tagName:'div',className:'responses',template:_.template($('#responses-template').html()),initialize:function(){this.model.bind('add',$.proxy(this.onAdd,this));},render:function(){var data=this.model.toJSON();data.qid=models.currentQuestion.id;data.did=models.currentDebate.id;$(this.el).html(this.template(data));this.addAll();if(this.model.length<=5){$(this.el).height(650-45);}
var qH=$('div.question').height();this.$('div.top-bar').css('top',78+qH);$(this.el).css('padding-top',qH+45);$('div.responses-outer').click(function(e){if($(e.target).hasClass('responses-outer')){window.location.href='/#/questions/'+models.currentQuestion.id+'/debates/'+models.currentDebate.id;}});return this;},onAdd:function(post){this.addOne(post);},addAll:function(){this.model.each(this.addOne,this);},addOne:function(item,index,append){var view=new ResponseItemView({model:item});var func=(append)?'append':'prepend';this.$('.responses-list')[func](view.render().el);},onResize:function(e){}});window.DebateDetailView=Backbone.View.extend({tagName:'div',template:_.template($('#debate-detail-template').html()),events:{'click a.join-debate-btn':'onJoinClick','click a.join-prevent':'showLogin','click a.stats-btn':'showStats','click a.like':'like','click a.flag':'flag',},initialize:function(){models.currentDebate.bind('change',$.proxy(this.onAddResponse,this));},render:function(){var data=this.model.toJSON();data.question=models.currentQuestion.attributes;data.raggedText=tools.ragText(data.firstPost.text,50);data.yesNoClass=(data.firstPost.yesNo)?'yes':'no';data.hasReplies=(data.posts.length>0);$(this.el).html(this.template(data));this.onAddResponse();return this;},showStats:function(e){e.preventDefault();commands.loadStats(models.currentQuestion.id);},showLogin:function(e){e.preventDefault();tools.openLoginPopup('Before you can start a debate, you need to log in or sign up first.');},onJoinClick:function(e){e.preventDefault();commands.showJoinDebateScreen();},onAddResponse:function(post){var posts=this.model.get('posts');if(posts.length>0){var excerpt=_.last(posts).text.substr(0,22);var count=this.model.get('posts').length-1;this.$('span.response-amt').text('"'+excerpt+'..." +'+count);}},flag:function(e){e.preventDefault();commands.flagPost(this.model.get('firstPost').id);},like:function(e){e.preventDefault();commands.likePost(this.model.get('firstPost').id,$.proxy(function(data){this.$('a.like strong').text(data.likes);},this));}});window.GalleryItemView=Backbone.View.extend({tagName:'li',className:'unselected',template:_.template($('#gallery-item-template').html()),render:function(){var data=this.model.toJSON();data.qid=models.currentQuestion.id;$(this.el).html(this.template(data)).addClass((data.yesNo==0)?'no':'yes');return this;},});window.GalleryView=Backbone.View.extend({el:$('div.debates-gallery'),events:{'click a.browse-all':'onBrowseAllClick',},initialize:function(){this.animate=false;this.model.bind('reset',this.addAll,this);this.model.bind('add',this.addOne,this);this.$container=this.$('div.gallery-container');this.$detail=this.$('div.detail');this.$ul=this.$('ul.debates');this.render();},render:function(){this.$('span.question-text').text(models.currentQuestion.get('text'));return this;},onBrowseAllClick:function(e){e.preventDefault();window.location.href='/#/questions/'+models.currentQuestion.id+'/debates';},addAll:function(){this.selectedIndex=-1;this.gWidth=0;this.items=[];this.model.each(this.addOne,this);},addOne:function(item,index){var view=new GalleryItemView({model:item});$(view.el).css({left:this.gWidth});this.$ul.append(view.render().el);this.gWidth+=$(view.el).width();this.$ul.width(this.gWidth);this.gWidth+=10;this.items.push(view);},setSelection:function(id){try{window.Responses.remove()}catch(e){}
try{window.Reply.remove()}catch(e){}
var item=this.model.getById(id);var index=this.model.indexOf(item);if(index==this.selectedIndex)return;try{this.detailView.remove()}catch(e){}
if(this.$selectedItem!=undefined){this.$selectedItem.removeClass('selected').addClass('unselected');}
this.selectedIndex=index;this.$selectedItem=$(this.$ul.children()[index]);this.dLeft=-parseInt(this.$selectedItem.css('left'));this.detailView=new DebateDetailView({model:models.currentDebate});this.detailView.render();this.$('div.arrows').hide();if(this.animate){this.$ul.stop().animate({'left':this.dLeft},{complete:$.proxy(function(e){this.$('div.arrows').show();this.$detail.append($(this.detailView.el).show());this.$selectedItem.removeClass('unselected').addClass('selected');},this)});}else{this.$ul.css({left:this.dLeft});this.$detail.append(this.detailView.render().el);this.$('div.arrows').show();this.$selectedItem.removeClass('unselected').addClass('selected');this.animate=true;}
this.onResize();},onResize:function(e,pos){pos=(pos==undefined)?this.el.css('position'):pos;this.el.css({"position":pos})
this.$('div.gallery-container').css({visibility:'visible'});}});window.HomeView=Backbone.View.extend({el:$('body.home-index'),initialize:function(){this.model.bind('change',this.render,this);},});window.Question=Backbone.Model.extend({urlRoot:'/api/questions',});window.Debate=Backbone.Model.extend({urlRoot:'/api/threads',});window.Post=Backbone.Model.extend({urlRoot:'/api/posts'})
window.DebateList=Backbone.Collection.extend({model:Debate,getById:function(id){for(var i=0;i<this.length;i++){var item=this.at(i);if(item.get('id')==id)return item}
return null;},});window.Stats=Backbone.Model.extend({urlRoot:'/api/stats/questions',});window.PostList=Backbone.Collection.extend({model:Post});window.GalleryItem=Backbone.Model.extend({});window.GalleryItemList=Backbone.Collection.extend({model:GalleryItem});if(window.models===undefined){window.models={}}
models.currentQuestion=new Question
models.currentDebates=new DebateList
models.currentDebate=new Debate
models.currentPosts=new PostList
models.currentStats=new Stats
models.browsingDebates=new DebateList
window.commands={}
commands.loadQuestion=function(qid,callback){if(models.currentQuestion.id!=qid){commands.showSpinner();models.currentQuestion.id=qid;models.currentQuestion.fetch({success:function(data){commands.hideSpinner();callback();}});}else{callback();}}
commands.loadDebates=function(qid,callback){var url='/api/questions/'+qid+'/threads';if(models.currentDebates.url!=url){commands.showSpinner();models.currentDebates.url=url;models.currentDebates.fetch({success:function(data){commands.hideSpinner();callback();}});}else{callback();}}
commands.loadDebate=function(did,callback){if(models.currentDebate.id!=did){commands.showSpinner();models.currentDebate.id=did;models.currentDebate.fetch({success:function(data){commands.hideSpinner();posts=models.currentDebate.get('posts').reverse()
posts.pop();models.currentPosts=new PostList(posts);callback();}});}else{callback();}}
commands.loadPosts=function(did,callback){if(did!=models.currentDebate.id){commands.showSpinner();models.currentPosts.url='/api/debates/'+did+'/posts';models.currentPosts.fetch({success:function(data){commands.hideSpinner();callback();}});}else{callback();}}
commands.loadStats=function(qid,callback){commands.showSpinner();models.currentStats.id=qid
models.currentStats.fetch({success:function(data){commands.hideSpinner()
commands.showStatsScreen();}});}
commands.closeModals=function(){$('div.question').css('background-color','rgba(255,255,255,0.60)')
try{window.BrowseMenu.remove();}catch(e){}
try{window.Stats.remove();}catch(e){}}
commands.showBrowseMenu=function(){window.BrowseMenu=new BrowseMenuView({model:models.browsingDebates});$('div.responses-outer').append($(BrowseMenu.render().el).show());Gallery.onResize(null,'fixed');$('div.question').css('background-color','rgba(255,255,255,1)');}
commands.showDebate=function(did,animate){Gallery.onResize(null,'relative');Gallery.setSelection(did,animate||true);commands.refreshResponsesHeight();}
commands.showDebateResponses=function(){Gallery.onResize(null,'fixed');window.Responses=new ResponsesView({model:models.currentPosts});$('div.responses-outer').append($(Responses.render().el).show());$('div.content-inner').height($('div.responses-outer').height()+120);Responses.onResize();$('div.responses').show();commands.refreshResponsesHeight();$('div.question').css('background-color','rgba(255,255,255,1)');}
commands.refreshResponsesHeight=function(){$('div.content-inner').height(Math.max(750,$('div.responses-outer').height()+120));}
commands.createGallery=function(){if(window.Gallery)return;window.Gallery=new GalleryView({model:models.currentDebates});resizeable.push(Gallery);}
commands.showReplyScreen=function(model){window.Reply=new ReplyView({'model':model});$('div.join-outer').append($(Reply.render().el).show());Gallery.onResize(null,'fixed');$('div.responses').hide();}
commands.showJoinDebateScreen=function(){window.JoinDebate=new JoinDebateView({model:models.currentDebate})
$('div.join-outer').append($(JoinDebate.render().el).show());Gallery.onResize(null,'fixed');}
commands.showSpinner=function(){window.PopupHolder.showPopup(new SpinnerView,null,0);}
commands.hideSpinner=function(){window.PopupHolder.closePopup();}
commands.showStatsScreen=function(){window.Stats=new StatsScreenView({model:models.currentStats})
Gallery.onResize(null,'fixed');}
commands.showWhatIsThis=function(){window.WhatIsThis=new WhatIsThisView();$('div.gallery-container').append(WhatIsThis.render().el);}
commands.flagPost=function(postId,callback){$.ajax({url:'/api/posts/'+postId+'/flag',type:'POST',dataType:'json',complete:function(data){alert("Thank you");},success:callback,});}
commands.likePost=function(postId,callback){$.ajax({url:'/api/posts/'+postId+'/like',type:'POST',dataType:'json',success:callback});}
var WorkspaceRouter=Backbone.Router.extend({routes:{'':'home','/questions/:qid':'questions','/questions/:qid/debates':'browse','/questions/:qid/debates/:did':'debates','/questions/:qid/debates/:did/posts':'posts','/whatisthis':'whatisthis'},home:function(){commands.closeModals();router.questions(questionId||"current");},questions:function(qid,callback){commands.closeModals();commands.loadQuestion(qid,function(data){commands.createGallery();commands.loadDebates(models.currentQuestion.id,function(data){if(callback){callback();}else{var mid=Math.floor(models.currentDebates.length/2);router.debates(models.currentQuestion.id,models.currentDebates.at(mid).get('id'));}});});},browse:function(qid,callback){commands.closeModals();router.questions(qid,function(data){commands.showBrowseMenu();});},debates:function(qid,did,callback){try{window.WhatIsThis.remove()}catch(e){}
commands.closeModals();router.questions(qid,function(data){commands.loadDebate(did,function(data){commands.showDebate(models.currentDebate.id);if(callback)callback();});});},posts:function(qid,did){commands.closeModals();router.debates(qid,did,function(data){commands.showDebateResponses();});},whatisthis:function(){if(models.currentQuestion.id==undefined){router.home();}
commands.showWhatIsThis();}});$(function(){window.Home=new HomeView({model:models.currentQuestion});window.router=new WorkspaceRouter();Backbone.history.start();});