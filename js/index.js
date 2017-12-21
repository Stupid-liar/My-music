//**********************************//
//by - dongdong                     //
//time: 2017.12.16;                 //
//**********************************//
var $btn = $("#btn"),
    $searchInput = $("#search-input"),
    $songListInfo = $("#song-list-info"),//显示歌
    $searchList = $("#searchList"),
    $music = $("#music"),
    $play;//播放按钮
var $oncheck;//存放选择按钮
var oBox = document.getElementById("con-con");//歌曲查询显示部分
var $info = $("#info");
var $progress = $("#progress");//所有信息
var $download = $("#download");//下载按钮

//js滚动条
var oContent = document.getElementById("song-list-info");
var oScroll = document.getElementById("scroll");
var oScrollHeight = oScroll.clientHeight;
var oBoxHeight = oBox.clientHeight;


// 暂停
var stop = false;
var $stop = $("#musicMiddle");

//上一曲
var $prev = $("#musicLeft");
var $li;

//下一曲
var $next = $("#musicRight");

var flag = true;//音量开关

var $songList = $("#song-list");
var $songListInfo = $("#song-list-info");//选中的项
//音量
var $voiveControl = $("#voiceControl");//音量控制
var $voice = $("#voice");
var $progress2 = $voice.find(".progress").eq(0);//音量的进度条
var $pot = $progress2.find(".pot").eq(0);
var pW = $progress2.width();

var maxNum;//存放长度，太长则显示省略号
var timer;//定时器进度条

var end = 110;//记录声音节点结束位置
//顺序播放和单曲循环
var way = true; //true顺序。false，单曲
var $songway = $("#flag");

//列表点击
var $list = $("#list");

var show = 0;//存放正在播放的歌词p标签的index值

var index;//当前播放的歌曲
// 初始化默认欧美风格
(function () {
    var url = 'https://route.showapi.com/213-4?showapi_appid=52163&showapi_test_draft=false&topid=3&showapi_sign=3548a74ec5c34e9b9b0e77b83499e59d';
    $.ajax({
        dataType: "json",
        url: url,
        type: "post",
        success: function (data) {
            var list = data.showapi_res_body.pagebean.songlist;
            init(list);
            scroll();
        }
    });
})();

//切换列表
$list.click(function (e) {
    var e = e || window.event;
    if(e.target.nodeName === "LI"){
        $(e.target).addClass("on").siblings().removeClass("on");
        var src = e.target.dataset.num;
        var url = 'https://route.showapi.com/213-4?showapi_appid=52163&showapi_test_draft=false&topid='+src+'&showapi_sign=3548a74ec5c34e9b9b0e77b83499e59d';
        $.ajax({
            dataType: "json",
            url: url,
            type: "post",
            success: function (data) {
                var list = data.showapi_res_body.pagebean.songlist;
                init(list);
                scroll();
                index = null;//切换列表是index复制为空
            }
        })
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


// 遍历数组显示歌单
function init(musicArray) {
    $songListInfo.html("");
    for (var key in musicArray) {
        musicArray[key].m4a = musicArray[key].m4a || musicArray[key].url;
        musicArray[key].albumname = musicArray[key].albumname || "";
        var $li = $("<li data-album='"+musicArray[key].albumname+"' data-id='"+musicArray[key].songid+"' data-pic='"+musicArray[key].albumpic_big+"' data-songSrc='"+musicArray[key].m4a+"' data-download='"+musicArray[key].downUrl+"' data-songId='"+musicArray[key].songid+"' data-songer='"+musicArray[key].singername+"' data-seconds='"+musicArray[key].seconds+"' data-songname='"+musicArray[key].songname+"'>\n" +
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
            "                            <span>收藏</span>\n" +
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
        $(this).parents("li").attr("play",true).siblings().attr("play",false);//设置为播放
        index = $(this).parents("li").index();
        songInfo(index);
        stop = true;//设置为可暂停
        $stop.prop("class","iconfont icon-pause-20");
    });
    oContent.style.top = '50px';
    //添加选中事件
    $songList.find(".checkbox").removeClass("oncheck");//初始化全选按钮默认为空
    $oncheck =  $songListInfo.find(".checkbox");
    $oncheck.click(function () {
        $(this).toggleClass("oncheck");
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

    //显示scroll点击消失
    /*(function(){
        var flag = true , flag1 = true;//用来scroll的显示隐藏的
        oBox.onmouseenter = function () {
            flag1 = false;
            oScroll.style.display = "block";
        };
        oBox.onmouseleave = function () {
            flag1 = true;
            flag && (oScroll.style.display = "none");
        };
        oScroll.onmousedown = function () {
            flag = false;
        };
        document.addEventListener("mouseup" , function () {
            flag = true;
            flag1 && (oScroll.style.display = "none");
        });
    })();*/

    //设定bar和content的top值
    function setTop(top) {
        //限定top的取值范围
        top = Math.max(top , 0);
        top = Math.min(top , maxBTop);
        oBar.style.top = top + "px";
        //求出content的top
        var cTop = top*maxCtop / maxBTop;
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

$stop.click(function () {
    if(stop){
        $music[0].pause();
        $stop.prop("class","iconfont icon-bofang1");
    }else {
        $music[0].play();
        $stop.prop("class","iconfont icon-pause-20");
    }
    stop = !stop;
});

//上一曲
$prev.click(function () {
    if(index === 0 ){
        index = $li.length - 1;
    }else{
        index--;
    }
    $li.eq(index).attr("play",true).siblings().attr("play",false);
    $music[0].src = $li.eq(index).attr("data-songSrc");
    songInfo(index);
});

//下一曲
$next.click(function () {
    if(index === $li.length - 1 ){
        index = 0;
    }else {
        index++;
    }
    $li.eq(index).attr("play",true).siblings().attr("play",false);
    $music[0].src = $li.eq(index).attr("data-songSrc");
    songInfo(index);
});


// 时间音量下载和作者等信息和右侧信息
function songInfo(index) {
    if($music[0].src !== undefined){
        $li = $songListInfo.find("li");
        var songname = $li.eq(index).attr("data-songname");//歌曲名
        var name = $li.eq(index).attr("data-songer");//歌手
        var time = $li.eq(index).attr("data-seconds");//歌曲时间
        var id = $li.eq(index).attr("data-songid");//歌曲id
        var pic = $li.eq(index).attr("data-pic");//歌曲图片
        var album = $li.eq(index).attr("data-album") || "未知";//歌曲专辑
        progress(time);//添加进度条
        var timerr = toSecond(time);
        $progress.find("p").eq(0).html(songname+"---"+name);
        $progress.find("p").eq(2).html(timerr);
        //$download.attr("href",$li.eq(index).attr("data-download"));//下载出问题了暂时无法下载
        $info.find("#img img").eq(0).prop("src",pic);
        $info.find("#singer-album p").eq(0).html(songname);
        $info.find("#singer-album p").eq(1).html(name);
        $info.find("#singer-album p").eq(2).html(album);
        ellipsis($info.find("#singer-album p").eq(0),15);
        ellipsis($info.find("#singer-album p").eq(1),15);
        ellipsis($info.find("#singer-album p").eq(2),15);
        // $info.find("#lyric .box").eq(0).html();
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
        })
    }
}


function HtmlDecode(str) {
    var div = document.createElement("div");
    div.innerHTML = str;
    return div.textContent || div.innerText;
}
//获取歌词
function lyric(id) {
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
        }
    })
}

$music.on("timeupdate",function () {
    var $box = $info.find("#lyric .box");
    var $lyric = $box.find("p");
    var pH = $lyric.height();

    $lyric.each(function () {
        if( Math.abs( $music[0].currentTime - this.id ) < 0.3){
            show = $(this).index();
        }
    });
    $lyric.eq(show).addClass("on").siblings().removeClass("on");
    $box.css({
        top: - ( $lyric.eq(show).position().top + $lyric.eq(show).height() - 200)//当前歌词的位置加上200px
    });
});
//存放歌词
var array = {};
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
    isNaN(time)?timerr = "/未获取":timerr= "/ " + toTwo(m)+":"+toTwo(s);//时间转换
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
}

//调节音量大小
(function () {
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
        });
        $(document).mouseup(function () {
            $(document).off("mousemove");
            $(document).off("mouseup");
        });
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
})();

//下载管理
(function () {
    $download.click(function () {
        alert("暂时未完成，无法下载~")
    })
})();
//进度控制
function progress(time) {
    timer && clearInterval(timer);//清除上一个定时器
    var end;//结束位置
    var $Pprogress = $("#progress").find(".progress").eq(0);
    var PW = $Pprogress.width();
    var $Ppot = $Pprogress.find(".pot").eq(0);
    $Ppot.css({
        left: 0
    });
    $Ppot.mousedown(function (e) {
        var x = e.clientX;
        var S = $Ppot.position().left; //初始位置
        $(document).mousemove(function (e) {
            var eX = e.clientX;
            var x_ = eX - x;
            end = x_ + S;
            end = Math.min(end,PW);
            end = Math.max(end,0);
            $Ppot.css({
                left: end
            });
        });
        $(document).mouseup(function () {
            $music[0].currentTime = (end/PW)*time;
            $(document).off("mousemove");
            $(document).off("mouseup");
        });
    });
    var time1;//存放当前时间
    timer = setInterval(function () {
        $Ppot.css({
            left: $music[0].currentTime/time*PW
        });
        time1 = $music[0].currentTime;
        var m = Math.floor(time1/60);
        var s = parseInt(time1%60);
        var time2 = toTwo(m)+":"+toTwo(s);//时间转换
        $progress.find("p").eq(1).html(time2);
        if($music[0].ended){
            clearInterval(timer);
            $li.eq(index).attr("play",false);
            if(way){
                index = (index === $li.length - 1)?0:index + 1;
            }
            $li.eq(index).attr("play",true);//设置当前为播放项
            $music[0].src = $li.eq(index).attr("data-songSrc");
            progress($li.eq(index).attr("data-seconds"));//添加进度
            $progress.find("p").eq(0).html($li.eq(index).attr("data-songname")+"---"+$li.eq(index).attr("data-songer"));//添加名字歌手信息
            $progress.find("p").eq(2).html(toSecond($li.eq(index).attr("data-seconds")));//添加时间等信息
            lyric($li.eq(index).attr("data-songid"));
            songInfo(index)
        }
    },1000);
    $Pprogress.click(function (e) {
        var x = e.clientX;
        var PL = $Pprogress.offset().left;
        var x_ = x - PL;
        $Ppot.css({
            left: x_
        });
        $music[0].currentTime = x_/PW*time;
    });
}

$songway.click(function () {
    way?$songway.prop("class","iconfont icon-danquxunhuan"):$songway.prop("class","iconfont  icon-shunxu");
    way = !way;
});

//选中操作
(function () {
    $songList.find(".checkbox").click(function () {
        if($songList.find(".checkbox").hasClass("oncheck")){
            $songListInfo.find(".checkbox").removeClass("oncheck");
            $songList.find(".checkbox").removeClass("oncheck");
        }else {
            $songListInfo.find(".checkbox").addClass("oncheck");
            $songList.find(".checkbox").addClass("oncheck");
        }
    })
})();
