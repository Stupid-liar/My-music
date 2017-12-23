//**********************************//
//by - 东东                         //
//time: 2017.12.16;                 //
// dec:一个基于qq音乐的音乐播放器， //
//**********************************//

/*获取部分（不可变量）*/
var $btn = $("#btn"),//搜索按钮
    $searchInput = $("#search-input"),//搜索框
    $songList = $("#song-list"),//歌曲头
    $songListInfo = $("#song-list-info"),//显示歌信息
    $searchList = $("#searchList"),//搜索提示框
    $music = $("#music"),//audio标签
    $stop = $("#musicMiddle"),
    $info = $("#info"),//右半部分歌曲歌词专辑显示部分
    $con = $("#con"),//中间歌曲信息部分
    $progress = $("#progress"),//所有信息初始化
    $download = $("#download"),//下载按钮
    $prev = $("#musicLeft"),//上一曲
    $next = $("#musicRight"),//下一曲
    $voiveControl = $("#voiceControl"),//音量控制
    $voice = $("#voice"),//音量部分
    $progress2 = $voice.find(".progress").eq(0),//音量的进度条
    $pot = $progress2.find(".pot").eq(0),//音量进度条的pot
    $songway = $("#flag"),//单曲与循环的方式
    $list = $("#list"),//左侧列表点击切换li列表
    pW = $progress2.width(),//音量进度条的宽度
    $Pprogress = $progress.find(".progress").eq(0),//存放进度条的进度
    PW = $Pprogress.width(),//进度条的宽度
    $Ppot = $Pprogress.find(".pot").eq(0),//进度条上的点
    $img = $("#img"),//两个图片
    $set = $("#set"),//纯净模式按钮
    $bg = $("#bg"),//背景开关按钮
    $headLove = $("#headLove"),
    $headDown = $("#headDown"),
    $headDelete = $("#headDelete"),
    $headEmpty = $("#headEmpty");//信息头四个按钮

/*存储变量（存储和音乐播放相关信息）*/
var maxNum,//存放长度，太长则显示省略号
    //timer,//定时器进度条(这里脑子没转过来没有用timeupdate事件，而是添加定时器)(后来不用了)
    show = 0,//存放正在播放的歌词p标签的index值(方便每次填入歌词是显示正确行数)
    index,//当前播放的歌曲（序号）
    $play,//播放按钮(便于改变列表时添加)
    $oncheck,//存放选择按钮
    $li,//存放所有显示的歌曲li
    array = {},//存放歌词
    sumTime;//存放总时间，随着播放源改变而改变

/*开关变量（可修改）*/
var way = true, //true顺序。false，单曲
    flag = true,//音量开关
    stop = false,// 暂停，true为可暂停，false表示已经暂停不可以在暂停
    leftRight = true,//纯净模式开关（改变位置ture为可以改变）
    bgflag = false,//true为有背景false表示没有背景显示默认背景
    end = 110;//记录声音节点结束位置(控制音量)(初始值可调节0~200左右视屏幕大小改变而改变)

//js滚动条（自动滚动条，没来的及写jq,把之前的js拿来用了）
var oContent = $songListInfo[0],
    oBox = $("#con-con")[0],//歌曲查询显示部分    （js方便自定义滚动条）
    oScroll = $("#scroll")[0],//自定义滚动条旁边的条
    oScrollHeight = oScroll.clientHeight,//可视高度
    oBoxHeight = oBox.clientHeight;


//屏幕串口改变大小
$(window).resize(function () {
    pW = $progress2.width();//音量进度条的宽度
    PW = $Pprogress.width();//进度条的宽度
    var width = $(window).width();
    $("#face").css({right: 0})
    if( width < 1400 && width > 1200){
        $list.css({
            display: "none"
        });
        $info.css({
            display: "block"
        });
        $con.css({
            width: "70%"
        });
        $info.css({
            width: "30%"
        })
    }
    if(width > 1400){
        $info.css({
            display: "block",
            width: "30%"
        });
        $list.css({
            display: "block",
            width: "15%"
        });
        $con.css({
            width: "55%"
        })
    }
})

//初始化,列表，进度条，音量，下载，选中效果
$(function () {
    //初始化,列表
    var list = musicData;
    init(list);
    scroll();
    //选中操作
    $songList.find(".checkbox").click(function () {
        if($songList.find(".checkbox input").attr("checked") === "checked"){
            $songListInfo.find(".checkbox").removeClass("oncheck");
            $songList.find(".checkbox").removeClass("oncheck");
            $songListInfo.find(".checkbox input").prop("checked",false);
            $songList.find("li input").attr("checked", false);
        }else {
            $songListInfo.find(".checkbox").addClass("oncheck");
            $songList.find(".checkbox").addClass("oncheck");
            $songList.find(".checkbox input").attr("checked", true);
            $songListInfo.find(".checkbox input").prop("checked",true);
        }
    });


    //下载管理
    $download.click(function () {
        $li = $songListInfo.find("li");
        this.href = $li.eq(index).attr("data-songSrc");
    });


    //进度控制
    $Ppot.mousedown(function (e) {
        var x = e.clientX;
        var S = $Ppot.position().left; //初始位置
        $music[0].pause();
        $(document).mousemove(function (e) {
            var eX = e.clientX;
            var x_ = eX - x;
            end = x_ + S;
            end = Math.min(end,PW);
            end = Math.max(end,0);
            $Ppot.css({
                left: end
            });
            $music[0].currentTime = (end/PW)*sumTime;
            $Pprogress.css({
                background: '-webkit-linear-gradient(left,red '+(end/PW) * 100/sumTime+'%, #ffffff '+(end/PW) * 100/sumTime+'%, #ffffff 100%)'
            });
        });
        $(document).mouseup(function () {
            $music[0].play();
            $(document).off("mousemove");
            $(document).off("mouseup");
        });
    });
    $Pprogress.click(function (e) {
        var x = e.clientX;
        var PL = $Pprogress.offset().left;
        var x_ = x - PL;
        $Ppot.css({
            left: x_
        });
        $music[0].currentTime = x_/PW*sumTime;
        $Pprogress.css({
            background: '-webkit-linear-gradient(left,red '+(x_/PW) * 100/sumTime+'%, #ffffff '+(x_/PW) * 100/sumTime+'%, #ffffff 100%)'
        });
    });


    //调节音量大小
    $pot.mousedown(function (e) {
        var x = e.clientX;
        var S = $pot.position().left; //初始位置
        $(document).mousemove(function (e) {
            var eX = e.clientX;
            var x_ = eX - x;
            end = x_ + S;
            end = Math.min(end,pW);
            end = Math.max(end,0);
            $pot.css({
                left: end
            });
            $music[0].volume = end/pW;
            $progress2.css({
                background: '-webkit-linear-gradient(left,red '+(end/pW) * 100+'%, #ffffff '+(end/PW) * 100+'%, #ffffff 100%)'
            })
        });
        $(document).mouseup(function () {
            $(document).off("mousemove");
            $(document).off("mouseup");
        });
    });
    $progress2.click(function (e) {
        var x = e.clientX;
        var PL = $progress2.offset().left;
        var x_ = x - PL;
        $pot.css({
            left: x_
        });
        $progress2.css({
            background: '-webkit-linear-gradient(left,red '+(x_/pW) * 100+'%, #ffffff '+(x_/pW) * 100+'%, #ffffff 100%)'
        });
        $music[0].volume = x_/pW ;
    });
    $voice.find("a").click(function () {
        if(flag){
            $music[0].volume = 0;
            $voiveControl.prop("class","iconfont icon-jingyin");
            $pot.css({
                left: 0
            });
        }else {
            $music[0].volume = end/pW || 1;
            $voiveControl.prop("class","iconfont icon-ttpodicon");
            $pot.css({
                left: end
            });
        }
        flag = !flag;
    });
});


/*搜索部分*/
//搜索自动提示功能
$searchInput.keyup(function (e) {
    if(e && e.keyCode === 13){
        $btn.click();
        index = null;//切换列表index为空
    }
    var os = document.createElement("script");
    $searchList.css({
        'display':$searchInput.val()?"block":"none"
    });
    os.src = "https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg?is_xml=0&key="+$searchInput.val()+"&jsonpCallback=cdd";
    document.body.appendChild(os);
    os.onload = function(){
        document.body.removeChild(this);
    }
});
function cdd(json) {
    var str;
    var array = json['data'];
    $searchList.find("ol").eq(0).html("");
    for(var key in array){
        str = "";
        for(var i in array[key]["itemlist"]){
            str = array[key]["itemlist"][i].name +"---"+ array[key]["itemlist"][i].singer ;
            var $li = $("<li>"+str+"</li>");
            $searchList.find("ol").eq(0).append($li);
        }
    }
}
//搜索之后点击查询
$searchList.find("ol").eq(0).click(function (e) {
    var target = e.target;
    if(target.nodeName === "LI"){
        var value = $(target).text();
        $searchInput.val(value);
        $btn.click();
        $searchList.css({
            display: 'none'
        });
    }
    index = null;//切换列表index为空
});



/*点击事件*/
//添加喜欢
$headLove.click(function () {
    $li = $songListInfo.find("li");
    var r;
    var loveMusic = [];
    var data = "";
    $li.each(function () {
        if($(this).find("input").is(":checked")){
            loveMusic = [];
            if(localStorage.getItem("loveMusic")){
                data = localStorage.getItem("loveMusic");
            }
            var obj = {
                "m4a": $(this).attr("data-songSrc"),
                "songid": $(this).attr("data-id"),
                "songname": $(this).attr("data-songname"),
                "albumpic_big": $(this).attr("data-pic"),
                "albumpic_small": $(this).attr("data-smallPic"),
                "albumname": $(this).attr("data-album"),
                "downUrl": $(this).attr("data-download"),
                "singername": $(this).attr("data-songer")
            };
            obj = JSON.stringify(obj);
            r = new RegExp('"songid":"'+$(this).attr("data-id")+'"');//这里单引号用来和加号连接变量和最外面一层，里面双引号用来写json数据的引号，不可以混用
            if(r.test(data)){
                alert("这首歌已经添加过了！不用再重复添加了")
            }else {
                data = data +"-"+ obj;
                loveMusic.push(data);
                localStorage.setItem("loveMusic",loveMusic);
            }
        }
    });
    if(loveMusic.length === 0){
        alert("请选择需要收藏的歌曲~")
    }else {
        alert("收藏成功~可在收藏列表中查看~")
    }
});
//添加下载
$headDown.click(function () {
    $li = $songListInfo.find("li");
    var array = [];
    $li.each(function () {
        if($(this).find("input").is(":checked")){
            var json = {
                "m4a": ""+$(this).attr("data-songSrc")+"",
                "downUrl": ""+$(this).attr("data-download")+""
            };
            array.push(json);
        }
    });
    if(array.length === 0){
        alert("请选择要下载的歌曲")
    }else {
        var length = array.length;
        for(var i = 0;i<length;i++){
            var a = document.createElement("a");
            a.href = array[i].m4a;
            a.download = array[i].downUrl;
            a.click();
        }
    }
});
//添加删除
$headDelete.click(function () {
    var listNum = $list.find("on").index();
    if(2 === listNum){

    }
});
//清空当前列表
$headEmpty.click(function () {
    var listNum = $list.find(".on").index();
    if(1 === listNum){
        localStorage.removeItem("loveMusic");
        $songListInfo.html("");
        $songListInfo.append($("<div style='width: 100%; height: 100%; text-align: center; line-height: 300px; font-size: 20px; color: #ffffff;'>暂时没有喜欢的歌曲，点击收藏添加~</div>"));
    }else {
        $songListInfo.html("");
        $songListInfo.append($("<div style='width: 100%; height: 100%; text-align: center; line-height: 300px; font-size: 20px; color: #ffffff;'>已经清除当前列表，刷新可重新显示~</div>"));
    }
});
//切换列表
$list.click(function (e) {
    var e = e || window.event;
    if(e.target.nodeName === "LI"){
        $(e.target).addClass("on").siblings().removeClass("on");
        var src = e.target.dataset.num;
        if("1" === src){
            console.log(0);
            var list1 = musicData;
            init(list1);
            scroll();
            return;
        }if("2" === src){
            if(localStorage.getItem("loveMusic")){
                var data = localStorage.getItem("loveMusic").split("-");
                var list2 = [];
                data.splice( 0 , 1 );
                console.log(data);
                for(var i = 0;i<data.length; i++){
                    list2[i] = JSON.parse(data[i]);
                }
                init(list2);
                scroll();
            }else {
                $songListInfo.html("");
                $songListInfo.append($("<div style='width: 100%; height: 100%; text-align: center; line-height: 300px; font-size: 20px; color: #ffffff;'>暂时没有喜欢的歌曲，点击收藏添加~</div>"));
            }
            return;
        }else {
            var url = 'https://route.showapi.com/213-4?showapi_appid=52163&showapi_test_draft=false&topid='+src+'&showapi_sign=3548a74ec5c34e9b9b0e77b83499e59d';
            $.ajax({
                dataType: "json",
                url: url,
                type: "post",
                success: function (data) {
                    var list3 = data.showapi_res_body.pagebean.songlist;
                    init(list3);
                    scroll();
                    index = null;//切换列表是index复制为空
                }
            })
            return;
        }
    }
});
// 点击查询功能
$btn.click(function () {
    if ($searchInput.val()) {
        var name = $searchInput.val();
        var url = 'https://route.showapi.com/213-1?keyword=' + name + '&page=1&showapi_appid=52163&showapi_test_draft=false&showapi_sign=3548a74ec5c34e9b9b0e77b83499e59d';
        $.ajax({
            dataType: "json",
            url: url,
            type: "post",
            success: function (data) {
                var musicArray = data.showapi_res_body.pagebean.contentlist;//获取音乐列表
                init(musicArray);
                scroll();
                $searchInput.attr("placeholder",$searchInput.val()+"(上次搜索内容)");
                $searchInput.val("");
                $searchList.css({
                    display: "none"
                });
                index = null;//切换列表index为空
            }
        });
    } else {
        alert("请输入查询内容");
        return false;
    }
});
//上一曲
$prev.click(function () {
    if(index === 0 ){
        index = $li.length - 1;
    }else{
        index--;
    }
    $music[0].src = $li.eq(index).attr("data-songSrc");
    changeBg();
    songInfo(index);
});
//下一曲
$next.click(function () {
    if(index === $li.length - 1 ){
        index = 0;
    }else {
        index++;
    }
    $music[0].src = $li.eq(index).attr("data-songSrc");
    changeBg();
    songInfo(index);
});
//暂停
$stop.click(function () {
    if(stop){
        $music[0].pause();
        $stop.prop("class","iconfont icon-bofang1");
        $img.find("img").removeClass("rotate");
    }else {
        $music[0].play();
        $stop.prop("class","iconfont icon-pause-20");
        $img.find("img").addClass("rotate");
    }
    stop = !stop;
});
//单曲和循环播放
$songway.click(function () {
    way?$songway.prop("class","iconfont icon-danquxunhuan"):$songway.prop("class","iconfont  icon-shunxu");
    way = !way;
});
//纯净模式按妞事件
$set.find(".small").click(function () {
    soft();
    leftRight = !leftRight;
});
$set.find("p").eq(0).click(function () {
    soft();
    leftRight = !leftRight;
});
//背景开关
$bg.find(".small").click(function () {
    if(!bgflag){
        $bg.find(".small").css({
            marginLeft: "50%"
        });
    }else {
        $bg.find(".small").css({
            marginLeft: 0
        });
    }
    bgflag = !bgflag;
    changeBg();
});
$bg.find("p").eq(0).click(function () {
    if(!bgflag){
        $bg.find(".small").css({
            marginLeft: "50%"
        });
    }else {
        $bg.find(".small").css({
            marginLeft: 0
        });
    }
    bgflag = !bgflag;
    changeBg();
});


/*音乐监听函数*/
//音乐添加时间更新歌词timeupdate,seeked和seeking事件监听播放源改变
$music.on("timeupdate",function () {
    //歌词部分
    var $box = $info.find("#lyric .box");
    var $lyric = $box.find("p");

    $lyric.each(function () {
        if( Math.abs( $music[0].currentTime - this.id ) < 0.3){
            show = $(this).index();
        }
    });
    $lyric.eq(show).addClass("on").siblings().removeClass("on");
    $box.css({
        top: - ( $lyric.eq(show).position().top + $lyric.eq(show).height() - 200)//当前歌词的位置加上200px
    });

    //进度控制
    $Ppot.css({
        left: $music[0].currentTime/sumTime*PW
    });
    $Pprogress.css({
        background: '-webkit-linear-gradient(left,red '+$music[0].currentTime * 100/sumTime+'%, #ffffff '+$music[0].currentTime * 100/sumTime+'%, #ffffff 100%)'
    });
    var m = Math.floor($music[0].currentTime/60);
    var s = parseInt($music[0].currentTime%60);
    var time2 = toTwo(m)+":"+toTwo(s);//时间转换
    $progress.find("p").eq(2).html(time2);
    $progress.find("p").eq(3).html(toSecond(sumTime));

    if($music[0].currentTime >= sumTime){
        $Ppot.css({
            left: 0
        });
        $Pprogress.css({
            background: '#ffffff'
        });
        if(way){
            index = (index === $li.length - 1)?0:index + 1;
        }
        $music[0].src = $li.eq(index).attr("data-songSrc");
        $progress.find("p").eq(1).html($li.eq(index).attr("data-songname")+"---"+$li.eq(index).attr("data-songer"));//添加名字歌手信息
        lyric($li.eq(index).attr("data-songid"));
        songInfo(index)
    }
});
$music.on("canplaythrough",function () {
    sumTime = $music[0].duration;
    if(isNaN(sumTime)){
        $music[0].load();
    }
    sumTime = $music[0].duration;
    sumTime = parseInt(sumTime);
});
//音乐播放异常,自动进入下一曲
$music.on("error",function () {
    $li = $songListInfo.find("li");
    $play = $(".play");
    (index === ($li.length - 1))?index = 0:index++;
    $play.eq(index).click();
});


// 遍历数组显示歌单
function init(musicArray) {
    $songListInfo.html("");
    for (var key in musicArray) {
        musicArray[key].m4a = musicArray[key].m4a || musicArray[key].url;
        musicArray[key].albumname = musicArray[key].albumname || "";
        var $li = $("<li data-album='"+musicArray[key].albumname+"' data-id='"+musicArray[key].songid+"' data-smallPic='"+musicArray[key].albumpic_small+"' data-pic='"+musicArray[key].albumpic_big+"' data-songSrc='"+musicArray[key].m4a+"' data-download='"+musicArray[key].downUrl+"' data-songId='"+musicArray[key].songid+"' data-songer='"+musicArray[key].singername+"' data-seconds='"+musicArray[key].seconds+"' data-songname='"+musicArray[key].songname+"'>\n" +
            "                    <div class='check fl-l'>\n" +
            "                    <div class='checkbox'>\n" +
            "                             <input type='checkbox'>\n" +
            "                         </div>\n" +
            "                    </div>\n" +
            "                    <div class='song fl-l'>\n" +
            "                        <span class='song-num'>" + (parseInt(key) + 1) + "</span>\n" +
            "                        <span class='song-name'>" + musicArray[key].songname + "</span>\n" +
            "                        <div class='none fl-r'>\n" +
            "                            <span class='play' data-src='" + musicArray[key].m4a + "'>播放</span>\n" +
            "                            <span><a href='" + musicArray[key].m4a + "' download='" + musicArray[key].downUrl + "'>下载</a></span>\n" +
            "                            <span class='love'>收藏</span>\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                    <div class='song-singer fl-l'>" + musicArray[key].singername + "</div>\n" +
            "                    <div class='song-time fl-r'>"+musicArray[key].albumname+"</div>\n" +
            "                </li>")
        $songListInfo.append($li);
        ellipsis($li.find(".song-name"),25)
    }
    //添加点击播放事件
    $play = $(".play");
    $play.click(function () {
        var songSrc = this.dataset.src;
        $music[0].src = songSrc;
        index = $(this).parents("li").index();
        songInfo(index);
        stop = true;//设置为可暂停
        $stop.prop("class","iconfont icon-pause-20");
        $Ppot.css({left: 0});
        $img.find("img").addClass("rotate");//添加图片转动
        changeBg()
    });
    //添加双击点击事件
    $li = $songListInfo.find("li");
    $li.dblclick(function () {
        console.log(0);
        var songSrc = $(this).attr("data-songSrc");
        $music[0].src = songSrc;
        index = $(this).index();
        songInfo(index);
        stop = true;//设置为可暂停
        $stop.prop("class","iconfont icon-pause-20");
        $Ppot.css({left: 0});
        $img.find("img").addClass("rotate");//添加图片转动
        changeBg()
    });
    //添加收藏事件
    $love = $(".love");
    $love.click(function () {
        var loveMusic = [];
        var data = "";
        if(localStorage.getItem("loveMusic")){
             data = localStorage.getItem("loveMusic");
        }
        var obj = {
            "m4a": $(this).parents("li").attr("data-songSrc"),
            "songid": $(this).parents("li").attr("data-id"),
            "songname": $(this).parents("li").attr("data-songname"),
            "albumpic_big": $(this).parents("li").attr("data-pic"),
            "albumpic_small": $(this).parents("li").attr("data-smallPic"),
            "albumname": $(this).parents("li").attr("data-album"),
            "downUrl": $(this).parents("li").attr("data-download"),
            "singername": $(this).parents("li").attr("data-songer")
        };
        obj = JSON.stringify(obj);
        var r = new RegExp('"songid":"'+$(this).parents("li").attr("data-id")+'"');//这里单引号用来和加号连接变量和最外面一层，里面双引号用来写json数据的引号，不可以混用
        if(r.test(data)){
            alert("这首歌已经添加过了！不用再重复添加了")
        }else {
            data = data +"-"+ obj;
            loveMusic.push(data);
            localStorage.setItem("loveMusic",loveMusic);
            alert("收藏成功~可在收藏列表中查看~")
        }
    });

    oContent.style.top = '50px';//信息距离上50px距离
    //添加选中事件
    $songList.find(".checkbox").removeClass("oncheck");//初始化全选按钮默认为空
    $songListInfo.find(".checkbox").removeClass("oncheck");
    $songList.find(".checkbox input").attr("checked",false);
    $songListInfo.find(".checkbox input").prop("checked",false);
    $songListInfo.find(".checkbox").click(function () {
        $(this).toggleClass("oncheck");
        $(this).find("input").attr("checked", !$(this).find("input").attr("checked"));
    })

}
//长度太长自动截取后面后面省略
function ellipsis($obj,num) {
    maxNum = $obj.html();
    if(maxNum.length>num){       //定义希望显示的长度
        $obj.html(maxNum.substr(0,num)+"...")      // 打印
    }
}
// 自定义滚动条js
function scroll() {
    var oBoxScrollHeight = oBox.scrollHeight;
    //先设定oBar的高度
    var barH = oBoxHeight * oBoxHeight / oBoxScrollHeight;
    oScroll.innerHTML = "<div class='bar'></div>";
    var oBar = oScroll.children[0];
    oBar.style.top = 0;
    oBar.style.height = barH + 'px';
    //获取最大值
    var maxBTop = oScrollHeight - barH;
    oScroll.style.display = "none";
    var maxCtop = oBoxScrollHeight - oBoxHeight;
    oBox.onmouseenter = function () {
        if(oBoxScrollHeight > oBox.clientHeight){
            oScroll.style.display = "block";
        }
    };
    oBox.onmouseleave = function () {
        oScroll.style.display = "none";
    };
    //bar的事件(拖动)
    oBar.onmousedown = function (e) {
        e = e || window.event;
        var sY = e.clientY,
            sT = this.offsetTop;
        document.onmousemove = function (e) {
            e = e || window.event;
            setTop(sT + e.clientY - sY);
        };
    };
    document.onmouseup = function () {
        this.onmousemove = null;
    };

    //给box添加滚轮事件
    mousewheel( oBox , function (e,d) {
        var top = oBar.offsetTop;
        d < 0?top += 20:top -= 20;
        setTop(top);
        return false;
    } );

    //scroll的点击事件
    //获取box距离可视区顶部的距离
    oBar.onclick = function (e) {
        e = e || window.event;
        e.cancelBubble = true;
    };
    oScroll.onclick = function (e) {
        e = e || window.event;
        // 鼠标距离可视区的top + 滚动高 - oBox距离文档的top - bar的高度一半
        // 鼠标距离可视区的top - bar的高度一半 - oBox距离文档的top + 滚动高
        var top = e.clientY - barH/2 - offset(oBox).top + (document.documentElement.scrollTop||document.body.scrollTop);
        setTop(top);
    };

    //设定bar和content的top值
    function setTop(top) {
        //限定top的取值范围
        top = Math.max(top , 0);
        top = Math.min(top , maxBTop);
        oBar.style.top = top + "px";
        //求出content的top
        var cTop = top*maxCtop / maxBTop;
        if(isNaN(cTop) || cTop === 0){
            $songList.css({
                display: "block"
            });
        }else if(!isNaN(cTop)){
            $songList.css({
                display: "none"
            });
        }
        oContent.style.top = -cTop + 50 +  'px';
    }
}
//滚轮事件
function mousewheel(obj , Fn) {
    function eFn(e) {
        e = e || window.event;
        if ( Fn.call(this,e,e.wheelDelta/120 || -e.detail/3) === false ){
            e.preventDefault && e.preventDefault();
            e.returnValue = false;
        }
    }
    document.onmousewheel!==undefined?obj.onmousewheel=eFn:obj.addEventListener('DOMMouseScroll',eFn,false);
}
//获取元素到文档的距离
function offset(obj){
    var json = {
        left : 0,
        top : 0
    };
    while ( obj !== document.body ){
        json.left += obj.offsetLeft;
        json.top += obj.offsetTop;
        obj = obj.offsetParent;
    }
    return json;
}
// 时间音量下载和作者等信息和右侧信息
function songInfo(index) {
    $li = $songListInfo.find("li");
    var songname = $li.eq(index).attr("data-songname");//歌曲名
    var name = $li.eq(index).attr("data-songer");//歌手
    var time = $li.eq(index).attr("data-seconds");//歌曲时间(暂时没有用)
    var id = $li.eq(index).attr("data-songid");//歌曲id
    var pic = $li.eq(index).attr("data-pic");//歌曲图片
    var smallPic = $li.eq(index).attr("data-smallPic");//歌曲图片(小图)
    var album = $li.eq(index).attr("data-album") || "未知";//歌曲专辑
    var num = $li.eq(index).find(".song-num").text();
    var download = $download.attr("href",$li.eq(index).attr("data-download"));//下载
    $progress.find("p").eq(0).html("当前播放：第"+num+"首");
    $progress.find("p").eq(1).html(songname+"---"+name);
    $download.prop("download",download)
    $info.find("#img img").eq(0).prop("src",pic);
    $info.find("#img img").eq(1).prop("src",smallPic);
    $info.find("#singer-album p").eq(0).html(songname);
    $info.find("#singer-album p").eq(1).html(name);
    $info.find("#singer-album p").eq(2).html(album);
    ellipsis($info.find("#singer-album p").eq(0),15);
    ellipsis($info.find("#singer-album p").eq(1),15);
    ellipsis($info.find("#singer-album p").eq(2),15);//长度太长显示省略号
    lyric(id);//显示歌词部分
    voice();
    //播放的动态提示条.gif动画
    $li.find(".song-num").css({
        background: "none",
        textIndent: 0,
        top: 0
    });
    $li.find(".song-num").eq(index).css({
        background: "url('img/wave.gif')no-repeat 0 20%/100%",
        textIndent: "-500px",
        top: "40%"
    });
}
//歌词需要转码
function HtmlDecode(str) {
    var div = document.createElement("div");
    div.innerHTML = str;
    return div.textContent || div.innerText;
}
//获取歌词
function lyric(id) {
    var id = id;
    var url;//存放搜错歌词的地址
    var lyric;
    $info.find("#lyric .box").eq(0).html("");
    url = 'https://route.showapi.com/213-2?musicid='+id+'&showapi_appid=52163&showapi_test_draft=false&showapi_sign=3548a74ec5c34e9b9b0e77b83499e59d';
    $.ajax({
        type: "get",
        url: url,
        dataType: "json",
        success: function (data) {
            lyric = data.showapi_res_body.lyric;
            lyric = HtmlDecode(lyric);//要进行转义

            toLyric(lyric);//歌词格式化
            if(array){
                for(var i in array){
                    var $p = $("<p id='"+i+"'>"+array[i]+"</p>");
                    $info.find("#lyric .box").eq(0).append($p);
                    // if($p.html().length > 10){
                    //     //歌词太长还没想好~
                    // }
                }
            }else {
                $info.find("#lyric .box").eq(0).append($("<p>未找到</p>"));
            }
            show = 0;//歌词条数从第一条开始
        },
        error:function () {
            lyric(id);
        }
    })
}
//歌词处理部分
function toLyric(data) {
    array = {};
    /*歌词处理*/
    var str1 = data.split("[");//时间和歌词
    var str2 = [];//存放时间
    var str3 = [];//存放歌词
    str1.splice(0,6);//去掉前六个无用数据

    for(var i = 0;i< str1.length;i++){
        str1[i] = str1[i].split("]");
        str2[i] = str1[i][0].split(":");//存放时间
        str3[i] = str1[i][1];
        var num = parseInt((str2[i][0]*60 + parseFloat(str2[i][1])));
        array[num] = str1[i][1];
    }
}
//传递秒数返回时间
function toSecond(time){
    var timerr;
    var m = Math.floor(time/60);
    var s = time%60;
    timerr= "/ " + toTwo(m)+":"+toTwo(s);//时间转换
    return timerr;
}
//时间位数不都补零
function toTwo(num) {
    return num<10?"0"+num:num;
}
//切换音乐时声音的大小
function voice() {
    var potL = $pot.position().left;
    var voice = potL/pW;
    flag?$music[0].volume = voice:$music[0].volume = 0;
    $progress2.css({
        background: '-webkit-linear-gradient(left,red '+voice * 100+'%, #ffffff '+voice * 100+'%, #ffffff 100%)'
    })
}
//纯净模式的点击效果
function soft() {
    $li = $songListInfo.find("li");
    if(leftRight){
        $set.find(".small").css({
            marginLeft: "50%"
        });
        //左边和中间消失只显示歌词部分
        $list.css({
            opacity: "0",
            filter: "alpha(opacity: 0)"
        });
        $con.css({
            opacity: "0",
            filter: "alpha(opacity: 0)"
        });
        $info.css({
            right: "35%"
        });
        setTimeout(function () {
            $list.css({
                display: "none"
            });
            $con.css({
                display: "none"
            });
        },1000)
    }else {
        $set.find(".small").css({
            marginLeft: 0
        });
        setTimeout(function () {
            $list.css({
                display: "block"
            });
            $con.css({
                display: "block"
            });
        },500);
        $list.css({
            opacity: "1",
            filter: "alpha(opacity: 100)"
        });
        $con.css({
            opacity: "1",
            filter: "alpha(opacity: 100)"
        });
        $info.css({
            right: 0
        })
    }
}
//背景切换的效果
function changeBg() {
    $li = $songListInfo.find("li");
    if(!bgflag){
        $("body").css({
            backgroundImage: "url('img/bg.jpg')"
        });
    }else {
        if(index) {
            $("body").css({
                backgroundImage: "url(" + $li.eq(index).attr("data-pic") + ")"
            })
        }else {
            $("body").css({
                backgroundImage: "url('img/bg.jpg')"
            })
        }
    }
}










