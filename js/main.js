const usernameSpan = document.getElementById("usernameSpan");
const belongSpan = document.getElementById("belongSpan");

const olePassBox = document.getElementById("oldPass-ChPassWin");
const newPassBox = document.getElementById("newPass-ChPassWin");
const newRepeatPassBox = document.getElementById("newRepeatPass-ChPassWin");

const roomnameBox = document.getElementById("roomname-newWin");
const timestartBox = document.getElementById("time_start-newWin");
const timeendBox = document.getElementById("time_end-newWin");

let rooms = {};
const date = {roomid:"", timestart:"", timeend:""};
const user = {username:""};

function delData(){
    var ids = [];
    var rows = $('#dt').datagrid('getSelections');
    for(var i=0; i<rows.length; i++){
        ids.push({
            username:rows[i].username,
            roomid:getItem(rooms,"roomname", rows[i].room_name).roomid,
            timestart:rows[i].time_start,
            timeend:rows[i].time_end
        });
    }

    axios.post(DelDataURL, {
        ids
    })
        .then(function (response) {
            const data = response.data;
            if(data.delResult){
                $.messager.alert("消息","删除成功！","info");
                getData();
            }else{
                $.messager.alert("错误","删除失败！请询问系统管理员！","error");
            }
        })
        .catch(error => $.messager.alert("错误","系统出现异常：" + error,"error"));
}

function getItem(arr,n,v) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i][n]===v)
            return arr[i];
}

function submitRoom(){
    if($('#nf').form('validate')) {
        const room_name = roomnameBox.value;
        const time_start = timestartBox.value;
        const time_end = timeendBox.value;

        Date.prototype.Format = function (fmt) { //author: meizz
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        };

        var time1 = new Date(time_start);
        var time2 = new Date(time_end);

        date.roomid = getItem(rooms, "roomname", room_name).roomid;
        date.timestart = time1.Format("yyyy-MM-dd hh:mm:ss");
        date.timeend = time2.Format("yyyy-MM-dd hh:mm:ss");

        if(time2.getTime() - time1.getTime() > 0){
            $.messager.confirm("操作提示", "您确定要添加这条记录吗？", function (data) {
                if(data) {
                    if((time2.getTime() - time1.getTime())/60000 > 180){
                        $.messager.confirm("操作提示", "例会时长超过三小时，确定添加？", function (data) {
                            if(data){
                                axios.post(ApplyURL, {
                                    room_id: date.roomid,
                                    time_start: date.timestart,
                                    time_end: date.timeend
                                })
                                    .then(function (response) {
                                        const data = response.data;
                                        if (data.applyResult) {
                                            $.messager.alert("消息", "提交成功！", "info");
                                            getData();
                                            $('#newWin').window('close');
                                        } else {
                                            $.messager.alert("警告", "存在冲突！提交失败！", "warning");
                                        }
                                    })
                                    .catch(error => $.messager.alert("错误", "系统出现异常：" + error, "error"));
                            }
                        })
                    }else{
                        axios.post(ApplyURL, {
                            room_id: date.roomid,
                            time_start: date.timestart,
                            time_end: date.timeend
                        })
                            .then(function (response) {
                                const data = response.data;
                                if (data.applyResult) {
                                    $.messager.alert("消息", "提交成功！", "info");
                                    getData();
                                    $('#newWin').window('close');
                                } else {
                                    $.messager.alert("警告", "存在冲突！提交失败！", "warning");
                                }
                            })
                            .catch(error => $.messager.alert("错误", "系统出现异常：" + error, "error"));
                    }
                }
            });

        }else{
            $.messager.alert("警告","输入非法！","warning");
        }

    }else{
        $.messager.alert("警告","请输入所有必填项！","warning");
    }
}

function getRoom(){
    $('#roomname-newWin').combobox({
        loader: (param,success) => {
            axios.post(GetRoomURL)
                .then((response) => {
                    success(response.data);
                    rooms = response.data;
                })
        },
        valueField:'roomname',
        textField:'roomname'
    });
}

function getData(){
    $("#dt").datagrid({
        loader: (param,success) => {
            //跨域请求数据
            axios.post(ShowDataURL)
                .then((response) => success(response.data))
        },
        width:1500,
        title:"例会列表",
        iconCls:"icon-search",
        rownumbers:true,
        remoteSort:false,
        columns:[[
            {title:"用户名",field:"username",width: 200},
            {title:"开会地点",field:"room_name",width: 200},
            {title:"开始时间",field:"time_start",width: 200,sortable:true,
                sorter:function(a,b){
                    const time1 = new Date(a);
                    const time2 = new Date(b);
                    const time = time1.getTime() - time2.getTime();
                    return time >= 0 ? 1 : -1;
                }},
            {title:"结束时间",field:"time_end",width: 200,sortable:true,
                sorter:function(a,b){
                    const time1 = new Date(a);
                    const time2 = new Date(b);
                    const time = time1.getTime() - time2.getTime();
                    return time >= 0 ? 1 : -1;
                }}
        ]]
    })
}

function getUserInfo(){
    axios.post(GetUserInfoURL)
        .then((response) => {
            usernameSpan.innerHTML = response.data.username;
            belongSpan.innerHTML = response.data.belong;
            user.username = response.data.username;
        })
        .catch(error => $.messager.alert("错误", "获取用户信息失败：" + error,"error"));
}

function logout() {
    axios.post(LogoutURL)
        .then(() => window.location.href = "./index.html")
        .catch(error => $.messager.alert("错误", "系统出现异常：" + error,"error"));
}

function chPass() {
    const oldPass = olePassBox.value;
    const newPass = newPassBox.value;
    const newRepeatPass = newRepeatPassBox.value;

    if (newPass === newRepeatPass) {
        //尝试修改密码
        const oldMD5Pass = hex_md5(oldPass + user.username);
        const newMD5Pass = hex_md5(newPass + user.username);

        axios.post(ChPassURL, {
            oldPassword: oldMD5Pass,
            newPassword: newMD5Pass
        })
            .then((response) => {
                if (response.data.userCh) {
                    $.messager.alert("提示", "密码修改成功！", "info", function () {
                        closeChPassWin();
                        tryLogin();
                    });
                } else {
                    $.messager.alert("警告", "密码修改失败！", "warning");
                }
            })
            .catch(error => $.messager.alert("错误", "系统出现异常:" + error, "error"));
    } else {
        //重复密码错误
        $.messager.alert("警告", "两次密码不一致！", "warning");
    }
}

function closeChPassWin(){
    olePassBox.value = "";
    newPassBox.value = "";
    newRepeatPassBox.value = "";
    $('#ChPassWin').window('close');
}

function newWinClose() {
    roomnameBox.value = "";
    timestartBox.value = "";
    timeendBox.value = "";
    $('#newWin').window('close');
}