/**
 * Created by liliwen on 2017/1/14.
 */
;(function() {
    var caches = {
        //屏幕宽度
        screenWidth: window.screen.availWidth,
        //图片url
        url: ['../../../../images/pic1.png', '../../../../images/pic2.png', '../../../../images/pic3.png'],
        //每个url图片生成的jq节点
        nodes: [],
        //当前显示的图片索引
        currentIndex: null,
        //当前整体的translate值
        currentTranslateXValue: null,
        //定时器引用
        autoMoveInterval: null,
        //定时器速度
        intervalSpeed: 3000,
        //移动速度
        moveSpeed: 0.5,
        //正在移动
        isMove: false,
        isReplace: false,
        isReplaceImage: false,
        isMouseIn: false,
        /**jq节点*/
        $carousel: $('#carousel'),
        $carouselPicList: $('#carouselPicList'),
        $carouselIndexList: $('#carouselIndexList')
    };

    var carousel = {
        init: function() {
            this.initPage();
            this.initEvent();
        },
        initPage: function () {
            this.ganeratePicNodes();
            this.paintPicNodes();
            this.generateAndPaintIndexPoints();
        },
        initEvent: function () {
            this.autoMove();
            this.stopAutoMove();
            this.continueAutoMove();
            this.clickIndexPoint();
        },
        /**生成图片节点*/
        ganeratePicNodes: function () {
            var i, len = caches.url.length, $node;
            //生成第一个节点
            ganerateUtil(null, caches.url[len - 1]);
            //生成url数组中所有节点
            for (i = 0; i < len; ++i) {
                ganerateUtil(i + 1, caches.url[i]);
            }
            //生成最后一个节点
            ganerateUtil(null, caches.url[0]);

            function ganerateUtil(dataIndex, url) {
                $node = $('<li>').addClass('carousel-picitem').css({
                    'background-image': 'url(' + url + ')',
                    'width': caches.screenWidth
                });
                if (dataIndex) $node.attr('data-index', dataIndex);
                caches.nodes.push($node);
            }
        },
        /**渲染图片节点*/
        paintPicNodes: function () {
            //记录
            this.record(1, -caches.screenWidth);
            //渲染
            caches.$carouselPicList.css({
                width: caches.screenWidth * (caches.url.length + 2),
                //让第二张图片显示在屏幕
                transform: carousel.makeTranslate(caches.currentTranslateXValue)
            });
            for (var i = 0, len = caches.nodes.length; i < len; ++i) {
                caches.$carouselPicList.append(caches.nodes[i]);
            }
        },
        /**生成translate*/
        makeTranslate: function(x) {
            return 'translate3d(' + x + 'px, 0px, 0px)';
        },
        /**记录数据：一些数据需要做即时记录*/
        record: function(currentIndex, translateX) {
            caches.currentIndex = Math.round(currentIndex);
            caches.currentTranslateXValue = Math.round(translateX);
        },
        /**自动移动*/
        autoMove: function () {
            caches.autoMoveInterval = setInterval(function() {
                carousel.moveToRightPicture();
            }, caches.intervalSpeed);
        },
        /**移动到右图*/
        moveToRightPicture: function() {
            //标记正在移动
            caches.isMove = true;
            var isMoveTimeout = setTimeout(function() {
                //取消正在移动标记
                caches.isMove = false;
                clearTimeout(isMoveTimeout);
            }, caches.moveSpeed * 1000);
            //记录当前位置信息
            this.record(caches.currentIndex + 1, caches.currentTranslateXValue - caches.screenWidth);
            //移动到右图
            caches.$carouselPicList.css({
                transform: carousel.makeTranslate(caches.currentTranslateXValue)
            });
            //移动到下一个索引
            this.changeActiveIndexPoint();

            //如果移动到了最后一张图片
            if (caches.currentIndex === caches.url.length + 1) {
                //正在替换，即偷梁换柱
                caches.isReplace = true;//大步骤
                caches.isReplaceImage = true;//图片替换小步骤
                //停止自动移动
                clearInterval(caches.autoMoveInterval);
                //偷梁换柱
                var restoreTranslateTimeout = setTimeout(function() {
                    //记录当前位置信息
                    carousel.record(1, -caches.screenWidth);
                    //把屏幕显示图片换成第二张，并且取消过度
                    caches.$carouselPicList.css({
                        transition: 'none',
                        transform: carousel.makeTranslate(caches.currentTranslateXValue)
                    });
                    //还原transition
                    var restoreTransitionTimeout = setTimeout(function() {
                        clearTimeout(restoreTranslateTimeout);
                        clearTimeout(restoreTransitionTimeout);
                        caches.$carouselPicList.css({
                            transition: 'transform ' + caches.moveSpeed + 's linear'
                        });
                    }, 50);//不同浏览器需要设置的时间不同，50可以保证满足所有浏览器
                    //完成图片替换
                    caches.isReplaceImage = false;
                    //替换后再次移动
                    var afterReplaceMoveTimeout = setTimeout(function() {
                        clearTimeout(afterReplaceMoveTimeout);
                        //鼠标移入禁止移动
                        if (caches.isMouseIn) {
                            //替换完成
                            caches.isReplace = false;
                            return ;
                        }
                        //移动到右图
                        carousel.moveToRightPicture();
                        //重新自动移动
                        carousel.autoMove();
                        //替换完成
                        caches.isReplace = false;
                    }, Math.abs(caches.intervalSpeed - caches.moveSpeed * 1000));
                }, caches.moveSpeed * 1000 + 100);
            }
        },
        /**生成索引*/
        generateAndPaintIndexPoints: function() {
            var i, len = caches.url.length;
            for (i = 0; i < len; ++i) {
                var className = 'carousel-indexitem';

                if (i == caches.currentIndex - 1) className += '-active';

                caches.$carouselIndexList.append($('<li>').attr('data-index', i + 1).addClass(className));
            }
        },
        /**改变激活的索引*/
        changeActiveIndexPoint: function() {
            if (caches.currentIndex == caches.url.length + 1) {
                //激活索引从最后一个变成第一个
                caches.$carouselIndexList
                    .find('li')
                    .attr('class', 'carousel-indexitem')
                    .first()
                    .attr('class', 'carousel-indexitem-active');
                return ;
            }
            //激活当前索引
            caches.$carouselIndexList.find('li').attr('class', 'carousel-indexitem').each(function(index) {
                if (index + 1 == caches.currentIndex) $(this).attr('class', 'carousel-indexitem-active');
            });
        },
        /**鼠标移入静止移动*/
        stopAutoMove: function() {
            caches.$carousel.on('mouseenter', function () {
                clearInterval(caches.autoMoveInterval);
                caches.isMouseIn = true;
            });
        },
        /**鼠标移除自动移动*/
        continueAutoMove: function () {
            caches.$carousel.on('mouseleave', function () {
                caches.isMouseIn = false;
                if (caches.isReplace) return ;
                carousel.autoMove();
            });
        },
        /**点击索引*/
        clickIndexPoint: function() {
            caches.$carouselIndexList.on('click', 'li', function(event) {
                //正在移动不允许点击
                if (caches.isMove) return ;
                //正在替换图片不允许点击
                if (caches.isReplaceImage) return ;
                //获取索引值
                var currentIndex = $(event.target).attr('data-index');
                //记录
                carousel.record(currentIndex, -currentIndex * caches.screenWidth);
                //改变索引
                carousel.changeActiveIndexPoint();
                //改变图片
                carousel.changeToAppointPic();
            });
        },
        /**改变到指定图片*/
        changeToAppointPic: function () {
            caches.$carouselPicList.css({
                transform: carousel.makeTranslate(caches.currentTranslateXValue)
            });
        }
    };

    carousel.init();
}());