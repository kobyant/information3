function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}


$(function(){

    // 打开登录框
    $('.comment_form_logout').click(function () {
        $('.login_form_con').show();
    })

    // 收藏
    $(".collection").click(function () {
        // 获取到该收藏标签的编号
        var news_id = $(".collection").attr('data-newid')

        // 操作类型设置成collect
        var action = "collect"

        // 封装参数
        var params = {
            "news_id":news_id,
            "action":action
        }

        // 发送请求
        $.ajax({
            url:"/news/news_collect",
            type:"POST",
            data:JSON.stringify(params),
            contentType:"application/json",
            headers:{"X-CSRFToken":getCookie('csrf_token')},
            success: function (resp) {
                if(resp.errno == '0'){
                    // location.reload()
                    // 设置隐藏和显示
                    $(".collection").hide()
                    $(".collected").show()
                    $(".collected").css("display","block")

                }else{
                    alert(resp.errmsg)
                }
            }
        })
       
    })

    // 取消收藏
    $(".collected").click(function () {
        //获取新闻编号
        var news_id = $(".collected").attr('data-newid')

        //参数操作类型
        var action = "cancel_collect"

        //拼接参数
        var params = {
            "action":action,
            "news_id":news_id
        }

        //发送请求,取消收藏
        $.ajax({
            url:"/news/news_collect",
            type:"POST",
            data:JSON.stringify(params),
            contentType:"application/json",
            headers:{"X-CSRFToken":getCookie('csrf_token')},
            success: function (resp) {
                if(resp.errno == "0"){
                    // location.reload()
                    // 设置隐藏和显示
                    $(".collection").show()
                    $(".collected").hide()

                }else{
                    alert(resp.errmsg)
                }
            }

        })
     
    })

        // 评论提交
    $(".comment_form").submit(function (e) {
        e.preventDefault();

        // 获取参数,评论内容,新闻编号
        var news_id = $(".comment_form").attr('data-newsid') // 属性值
        var comment = $(".comment_input").val() // value值

        if(!comment) return "评论不能为空"

        //拼接参数
        var params = {
            "news_id":news_id,
            "comment":comment
        }

        //发送请求
        $.ajax({
            url:"/news/news_comment",
            type:"POST",
            data:JSON.stringify(params),
            contentType:"application/json",
            headers:{"X-CSRFToken":getCookie('csrf_token')},
            success: function (resp) {
                //判断
                if(resp.errno == "0"){

                 //拼接评论的字符串内容

                 var comment = resp.data

                 var comment_html = '<div class="comment_list">'
                 comment_html += '<div class="person_pic fl">'
                 comment_html += '<img src="../../static/news/images/worm.jpg" alt="用户图标">'
                 comment_html += '</div>'
                 comment_html += '<div class="user_name fl">'+ comment.user.nick_name +'</div>'
                 comment_html += '<div class="comment_text fl">'
                 comment_html += comment.content
                 comment_html += '</div>'
                 comment_html += '<div class="comment_time fl">'+ comment.create_time +'</div>'
                 comment_html += '<a href="javascript:;" class="comment_up has_comment_up fr">1</a>'
                 comment_html += '<a href="javascript:;" class="comment_reply fr">回复</a>'
                 comment_html += '<from class="reply_form fl" data-commentid="'+ comment.id +'" data-newsid="'+ comment.news_id +'">'
                 comment_html += '<textarea  class="reply_input"></textarea>'
                 comment_html += '<input type="submit" name="" value="回复" class="reply_sub fr">'
                 comment_html += '<input type="reset" name="" value="取消" class="reply_cancel fr">'
                 comment_html += '</from>'
                 comment_html += '</div>'

                //将拼接好的内容设置到comment_list_con中(div容器)
                $(".comment_list_con").html(comment_html)

                //让评论的标签comment_sub 失去焦点
                $(".comment_sub").blur()

                //清空输入评论输入框comment_input的内容
                $(".comment_input").html('')
                }
            }
        })


    })

    $('.comment_list_con').delegate('a,input','click',function(){

        var sHandler = $(this).prop('class');

        if(sHandler.indexOf('comment_reply')>=0)
        {
            $(this).next().toggle();
        }

        if(sHandler.indexOf('reply_cancel')>=0)
        {
            $(this).parent().toggle();
        }

        if(sHandler.indexOf('comment_up')>=0)
        {
            // 获取到点赞对象
            var $this = $(this);
            // 设置初始化操作为点赞
            var action = "add"
            if(sHandler.indexOf('has_comment_up')>=0)
            {
                // 如果当前该评论已经是点赞状态，再次点击会进行到此代码块内，代表要取消点赞
                action = "remove"
            }

            //获取到评论的评论编号
            var comment_id = $(this).attr("data-commentid")
            //获取到新闻编号
            var news_id = $(this).attr("data-newsid")
            //拼接参数
            var params = {
                "comment_id": comment_id,
                "action": action,
                "news_id": news_id
            }

            //发送ajax请求
            $.ajax({
                url: "/news/comment_like",
                type: "post",
                contentType: "application/json",
                headers: {
                    "X-CSRFToken": getCookie("csrf_token")
                },
                data: JSON.stringify(params),
                success: function (resp) {

                    //获取到当前标签的次数
                    var like_count =  $this.attr('data-likecount')

                    if (resp.errno == "0") {
                        // 更新点赞按钮图标
                        if (action == "add") {
                            // 代表是点赞
                            $this.addClass('has_comment_up')

                            // 修改次数
                            like_count = parseInt(like_count) + 1
                        }else {
                            $this.removeClass('has_comment_up')

                            // 修改取消点赞次数
                            like_count = parseInt(like_count) - 1
                        }

                        //更新点赞次数
                        $this.attr('data-likecount',like_count)
                        if(like_count == 0){
                            $this.html('赞')
                        }else{
                            $this.html(like_count)
                        }

                    }else if (resp.errno == "4101"){
                        $('.login_form_con').show();
                    }else {
                        alert(resp.errmsg)
                    }
                }
            })
        }

        if(sHandler.indexOf('reply_sub')>=0)
        {
            //获取到当前对象(评论表单)
            var $this = $(this)

            //获取到当前表单中的值,分别是:新闻编号,评论对象编号,评论内容
            var news_id = $this.parent().attr('data-newsid')
            var parent_id = $this.parent().attr('data-commentid')
            var comment = $this.prev().val()

            //判断是否输入了内容
            if(!comment) return "没有输入评论内容"

            //拼接参数
            var params = {
                "news_id":news_id,
                "parent_id":parent_id,
                "comment":comment
            }

            //发送请求
            $.ajax({
                url:"/news/news_comment",
                type:"POST",
                data:JSON.stringify(params),
                contentType:"application/json",
                headers:{"X-CSRFToken":getCookie('csrf_token')},
                success: function (resp) {
                    //判断是否评论成功
                    if(resp.errno == "0"){
                        var comment = resp.data

                        //拼接字符串
                        var comment_html = '<div class="comment_list">'
                        comment_html += '<div class="person_pic fl">'
                        comment_html += '<img src="../../static/news/images/worm.jpg" alt="用户图标">'
                        comment_html += '</div>'
                        comment_html += '<div class="user_name fl">'+ comment.user.nick_name +'</div>'
                        comment_html += '<div class="comment_text fl">'
                        comment_html += comment.content
                        comment_html += '</div>'
                        comment_html += '<div class="reply_text_con fl">'
                        comment_html += '<div class="user_name2">'+ comment.parent.user.nick_name +'</div>'
                        comment_html += '<div class="reply_text">'
                        comment_html += comment.parent.content
                        comment_html += '</div>'
                        comment_html += '</div>'
                        comment_html += '<div class="comment_time fl">'+ comment.create_time +'</div>'
                        comment_html += '<a href="javascript:;" class="comment_up has_comment_up fr">1</a>'
                        comment_html += '<a href="javascript:;" class="comment_reply fr">回复</a>'
                        comment_html += '<from class="reply_form fl" data-news_id="" data-comment_id="">'
                        comment_html += '<textarea  class="reply_input"></textarea>'
                        comment_html += '<input type="submit" name="" value="回复" class="reply_sub fr">'
                        comment_html += '<input type="reset" name="" value="取消" class="reply_cancel fr">'
                        comment_html += '</from>'
                        comment_html += '</div>'

                        //将拼接的字符串,插入到到comment_list_con容器中
                        $(".comment_list_con").prepend(comment_html)

                        //清空输入框
                        $this.prev().val()

                        //关闭评论当前评论框
                        $this.parent().hide()

                    }else{
                        alert(resp.errmsg)
                    }
                }

            })


        }
    })

        // 关注当前新闻作者
    $(".focus").click(function () {
        var user_id = $(this).attr('data-userid')
        var params = {
            "action": "follow",
            "user_id": user_id
        }
        $.ajax({
            url: "/news/followed_user",
            type: "post",
            contentType: "application/json",
            headers: {
                "X-CSRFToken": getCookie("csrf_token")
            },
            data: JSON.stringify(params),
            success: function (resp) {
                if (resp.errno == "0") {
                    // 关注成功
                    var count = parseInt($(".follows b").html());
                    count++;
                    $(".follows b").html(count + "")
                    $(".focus").hide()
                    $(".focused").show()
                }else if (resp.errno == "4101"){
                    // 未登录，弹出登录框
                    $('.login_form_con').show();
                }else {
                    // 关注失败
                    alert(resp.errmsg)
                }
            }
        })

    })

    // 取消关注当前新闻作者
    $(".focused").click(function () {
         var user_id = $(this).attr('data-userid')
        var params = {
            "action": "unfollow",
            "user_id": user_id
        }
        $.ajax({
            url: "/news/followed_user",
            type: "post",
            contentType: "application/json",
            headers: {
                "X-CSRFToken": getCookie("csrf_token")
            },
            data: JSON.stringify(params),
            success: function (resp) {
                if (resp.errno == "0") {
                    // 取消关注成功
                    var count = parseInt($(".follows b").html());
                    count--;
                    $(".follows b").html(count + "")
                    $(".focus").show()
                    $(".focused").hide()
                }else if (resp.errno == "4101"){
                    // 未登录，弹出登录框
                    $('.login_form_con').show();
                }else {
                    // 取消关注失败
                    alert(resp.errmsg)
                }
            }
        })
    })
})